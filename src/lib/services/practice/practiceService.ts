import { hashPassword } from "@/lib/utils/auth";
import { OpeningHoursItem, Practice, PracticePreferences } from "@/types/practice";
import { NearbyPractice } from "@/types/practice";
import { uploadFileBuffer, deleteFileFromS3, extractKeyFromS3Url } from '@/lib/integrations/s3Service';
import { geocodePostcode, toGeoJSONPoint } from '@/lib/utils/location';

const HASURA_GRAPHQL_URL = process.env.HASURA_GRAPHQL_URL!;
const HASURA_ADMIN_SECRET = process.env.HASURA_ADMIN_SECRET!;

const CREATE_PRACTICE_AND_USER_MUTATION = `
  mutation CreatePracticeAndUser(
    $practice_name: String!,
    $email: String!,
    $password: String!,
    $phone_number: String,
    $photo: String,
    $address: jsonb,
    $opening_hours: jsonb,
    $location: geometry,
    $allowed_types: [String!],
    $pricing_matrix: jsonb
  ) {
    insert_practices_one(
      object: {
        practice_name: $practice_name,
        email: $email,
        phone_number: $phone_number,
        photo: $photo,
        address: $address,
        opening_hours: $opening_hours,
        verified: false,
        location: $location,
        allowed_types: $allowed_types,
        pricing_matrix: $pricing_matrix,
        users: {
          data: {
            first_name: "",
            last_name: "",
            email: $email,
            password: $password,
            role: "unverified-practice"
          }
        }
      }
    ) {
      practice_id
      practice_name
      users {
        user_id
        email
      }
    }
  }
`;

/**
 * Creates a new dental practice and an associated user.
 * 
 * - Hashes the user's password.
 * - Geocodes the practice's address to get location coordinates.
 * - Sends a GraphQL mutation to insert the practice and user.
 * - Adds default practice preferences after creation.
 * 
 * @param {Object} params - Practice and user details.
 * @returns {Promise<Object>} - Created practice and user data.
 * @throws {Error} - If registration fails.
 */
export async function createPracticeWithUser({
  practiceName,
  email,
  password,
  phoneNumber,
  photo,
  address,
  openingHours,
  allowedTypes,
  pricingMatrix,
}: {
  practiceName: string;
  email: string;
  password: string;
  phoneNumber?: string;
  photo?: string;
  address: Record<string, string>;
  openingHours: Array<{ dayName: string; open: string; close: string }>;
  allowedTypes?: string[];
  pricingMatrix?: Record<string, number>;
}) {
  try {
    const hashedPassword = await hashPassword(password);
    const coords = await geocodePostcode(address.postcode);
    const location = toGeoJSONPoint(coords);

    const response = await fetch(HASURA_GRAPHQL_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-hasura-admin-secret": HASURA_ADMIN_SECRET,
      },
      body: JSON.stringify({
        query: CREATE_PRACTICE_AND_USER_MUTATION,
        variables: {
          practice_name: practiceName,
          email,
          password: hashedPassword,
          phone_number: phoneNumber,
          photo,
          address,
          opening_hours: openingHours,
          location,
          allowed_types: allowedTypes,
          pricing_matrix: pricingMatrix,
        },
      }),
    });

    const result = await response.json();

    if (!response.ok || result.errors) {
      throw new Error(result.errors?.[0]?.message || "Practice registration failed.");
    }

    await insertPracticePreferences(result.data.insert_practices_one.practice_id);

    return {
      practice_id: result.data.insert_practices_one.practice_id,
      practice_name: result.data.insert_practices_one.practice_name,
      user: result.data.insert_practices_one.users[0],
    };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Practice registration failed. Please try again.";
    console.error("Practice Registration Error:", error);
    throw new Error(message);
  }
}

/**
 * Inserts a practice preferences record with default values for a given practice.
 * 
 * @param practiceId - The UUID of the practice.
 * @returns The inserted practice preferences.
 * @throws Error if the insertion fails.
 */
export async function insertPracticePreferences(practiceId: string): Promise<PracticePreferences> {
  const mutation = `
    mutation InsertPracticePreferences($prefsData: practice_preferences_insert_input!) {
      insert_practice_preferences_one(object: $prefsData) {
        practice_id
        enable_notifications
        enable_mobile_notifications
        enable_email_notifications
        notify_on_new_booking
        hide_delete_confirmation
      }
    }
  `;

  try {
    const response = await fetch(HASURA_GRAPHQL_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-hasura-admin-secret": HASURA_ADMIN_SECRET,
      },
      body: JSON.stringify({
        query: mutation,
        variables: {
          prefsData: {
            practice_id: practiceId,
            enable_notifications: true,
            enable_mobile_notifications: true,
            enable_email_notifications: true,
            notify_on_new_booking: true,
            hide_delete_confirmation: false,
          },
        },
      }),
    });

    const result = await response.json();

    if (!response.ok || result.errors) {
      throw new Error(result.errors?.[0]?.message || "Failed to insert practice preferences.");
    }

    return result.data.insert_practice_preferences_one;
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Error inserting practice preferences";
    console.error("Insert Practice Preferences Error:", message);
    throw new Error(message);
  }
}


export async function fetchPendingDentalPractices() {
  const query = `
    query FetchPendingDentalPractices {
      practices(where: { verified: { _eq: false } }) {
        practice_id
        practice_name
        email
        phone_number
        photo
        address
        opening_hours
        verified
        created_at
        updated_at
      }
    }
  `;

  try {
    const response = await fetch(HASURA_GRAPHQL_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-hasura-admin-secret": HASURA_ADMIN_SECRET,
      },
      body: JSON.stringify({ query }),
    });

    const result = await response.json();

    if (!response.ok || result.errors) {
      throw new Error(result.errors?.[0]?.message || "Fetching pending practices failed.");
    }

    return result.data.practices;
  } catch (error) {
    console.error("Error fetching pending practices:", error);
    throw new Error("Fetching pending practices failed.");
  }
}

export async function fetchApprovedDentalPractices() {
  const query = `
    query FetchApprovedDentalPractices {
      practices(
        where: { verified: { _eq: true } }
        order_by: { verified_at: desc }
      ) {
        practice_id
        practice_name
        email
        phone_number
        photo
        address
        opening_hours
        verified
        created_at
        updated_at
        verified_at
      }
    }
  `;

  try {
    const response = await fetch(HASURA_GRAPHQL_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-hasura-admin-secret": HASURA_ADMIN_SECRET,
      },
      body: JSON.stringify({ query }),
    });

    const result = await response.json();

    if (!response.ok || result.errors) {
      throw new Error(result.errors?.[0]?.message || "Fetching approved practices failed.");
    }

    return result.data.practices;
  } catch (error) {
    console.error("Error fetching approved practices:", error);
    throw new Error("Fetching approved practices failed.");
  }
}

export async function approvePractice(practiceId: string) {
  const mutation = `
    mutation ApprovePractice($practiceId: uuid!, $verifiedAt: timestamp!) {
      update_practices_by_pk(
        pk_columns: { practice_id: $practiceId }
        _set: { verified: true, verified_at: $verifiedAt }
      ) {
        practice_id
        verified
        verified_at
      }
      update_users(
        where: { practice_id: { _eq: $practiceId } }
        _set: { role: "verified-practice" }
      ) {
        affected_rows
      }
    }
    `;

  try {
    const response = await fetch(HASURA_GRAPHQL_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-hasura-admin-secret": HASURA_ADMIN_SECRET,
      },
      body: JSON.stringify({
        query: mutation,
        variables: {
          practiceId,
          verifiedAt: new Date().toISOString(),
        },
      }),
    });

    const result = await response.json();

    if (!response.ok || result.errors) {
      throw new Error(result.errors?.[0]?.message || "Approving practice failed.");
    }

    return result.data.update_practices_by_pk;
  } catch (error) {
    console.error("Error approving practice:", error);
    throw new Error("Approving practice failed.");
  }
}

export async function denyPractice(practiceId: string) {
  const mutation = `
    mutation DenyPractice($practiceId: uuid!) {
      delete_practices_by_pk(practice_id: $practiceId) {
        practice_id
      }
    }
  `;

  try {
    const response = await fetch(HASURA_GRAPHQL_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-hasura-admin-secret": HASURA_ADMIN_SECRET,
      },
      body: JSON.stringify({
        query: mutation,
        variables: { practiceId },
      }),
    });

    const result = await response.json();

    if (!response.ok || result.errors) {
      throw new Error(result.errors?.[0]?.message || "Denying practice failed.");
    }

    return result.data.delete_practices_by_pk;
  } catch (error) {
    console.error("Error denying practice:", error);
    throw new Error("Denying practice failed.");
  }
}

export async function fetchPracticeById(practiceId: string) {
  console.log("Fetching practice details for:", practiceId);
  const query = `
    query GetPracticeDetails($practiceId: uuid!) {
      practices_by_pk(practice_id: $practiceId) {
        practice_id
        practice_name
        email
        phone_number
        photo
        address
        opening_hours
        verified
        verified_at
        created_at
        updated_at
      }
    }
  `;

  try {
    const response = await fetch(HASURA_GRAPHQL_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-hasura-admin-secret": HASURA_ADMIN_SECRET,
      },
      body: JSON.stringify({ query, variables: { practiceId } }),
    });

    const result = await response.json();

    if (!response.ok || result.errors) {
      throw new Error(result.errors?.[0]?.message || "Fetching practice details failed.");
    }

    return result.data.practices_by_pk;
  } catch (error) {
    console.error("Error fetching practice details:", error);
    throw new Error("Fetching practice details failed.");
  }
}

export async function fetchPracticeAndPreferencesById(practiceId: string) {
  const query = `
    query GetPracticeAndPreferences($practiceId: uuid!) {
      practice: practices_by_pk(practice_id: $practiceId) {
        practice_id
        practice_name
        email
        phone_number
        photo
        address
        opening_hours
        verified
        created_at
        updated_at
        verified_at
        practice_preferences {
          enable_notifications
          enable_mobile_notifications
          enable_email_notifications
          notify_on_new_booking
          hide_delete_confirmation
          created_at
          updated_at
        }
      }
    }
  `;

  try {
    const response = await fetch(HASURA_GRAPHQL_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-hasura-admin-secret": HASURA_ADMIN_SECRET,
      },
      body: JSON.stringify({ query, variables: { practiceId } }),
    });

    const result = await response.json();

    if (!response.ok || result.errors) {
      throw new Error(result.errors?.[0]?.message || "Error fetching practice data");
    }

    return result.data.practice;
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to fetch practice data";
    console.error("Error in fetchPracticeAndPreferencesById:", message);
    return null;
  }
}

export async function updatePracticeSettings(practiceId: string, settings: Partial<Practice>) {
  const mutation = `
    mutation UpdatePracticeSettings($practiceId: uuid!, $settings: practices_set_input!) {
      update_practices_by_pk(pk_columns: { practice_id: $practiceId }, _set: $settings) {
        practice_id
        practice_name
        email
        phone_number
        photo
        address
        opening_hours
      }
    }
  `;
  const response = await fetch(HASURA_GRAPHQL_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-hasura-admin-secret": HASURA_ADMIN_SECRET,
    },
    body: JSON.stringify({ query: mutation, variables: { practiceId, settings } }),
  });
  const result = await response.json();
  if (!response.ok || result.errors) {
    throw new Error(result.errors?.[0]?.message || "Error updating practice settings");
  }
  return result.data.update_practices_by_pk;
}

export async function validateOpeningHours(practiceId: string, newOpeningHours: OpeningHoursItem[]) {
  // For simplicity, call the appointments API with a wide date range and check each appointment.
  // In production you might create a dedicated API endpoint.
  const query = `
    query GetAppointments($practiceId: uuid!) {
      appointments(where: { practice_id: { _eq: $practiceId } }) {
        appointment_id
        start_time
        end_time
      }
    }
  `;
  const response = await fetch(HASURA_GRAPHQL_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-hasura-admin-secret": HASURA_ADMIN_SECRET,
    },
    body: JSON.stringify({ query, variables: { practiceId } }),
  });
  const result = await response.json();
  if (!response.ok || result.errors) {
    throw new Error(result.errors?.[0]?.message || "Error validating opening hours");
  }
  const appointments = result.data.appointments;
  // For each appointment, check if its time falls within the new opening hours for that day.
  for (const appt of appointments) {
    const startDate = new Date(appt.start_time);
    const dayName = startDate.toLocaleDateString("en-US", { weekday: "long" });
    const dayOH = newOpeningHours.find((oh: OpeningHoursItem) => oh.dayName === dayName);
    if (!dayOH || dayOH.open.toLowerCase() === "closed" || dayOH.close.toLowerCase() === "closed") {
      throw new Error(`Appointment ${appt.appointment_id} falls on ${dayName} which is now closed`);
    }
    const [openHour, openMinute] = dayOH.open.split(":").map(Number);
    const [closeHour, closeMinute] = dayOH.close.split(":").map(Number);
    const openDate = new Date(startDate);
    openDate.setHours(openHour, openMinute, 0, 0);
    const closeDate = new Date(startDate);
    closeDate.setHours(closeHour, closeMinute, 0, 0);
    if (startDate < openDate || new Date(appt.end_time) > closeDate) {
      throw new Error(`Appointment ${appt.appointment_id} falls outside new opening hours for ${dayName}`);
    }
  }
  return true;
}

export async function updatePracticePreferences(practiceId: string, prefs: Partial<PracticePreferences>) {
  const mutation = `
    mutation UpdatePracticePreferences($practiceId: uuid!, $prefs: practice_preferences_set_input!) {
      update_practice_preferences_by_pk(pk_columns: { practice_id: $practiceId }, _set: $prefs) {
        practice_id
        enable_notifications
        enable_mobile_notifications
        enable_email_notifications
        notify_on_new_booking
        hide_delete_confirmation
      }
    }
  `;
  const response = await fetch(HASURA_GRAPHQL_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-hasura-admin-secret": HASURA_ADMIN_SECRET,
    },
    body: JSON.stringify({ query: mutation, variables: { practiceId, prefs } }),
  });
  const result = await response.json();
  if (!response.ok || result.errors) {
    throw new Error(result.errors?.[0]?.message || "Error updating practice preferences");
  }
  return result.data.update_practice_preferences_by_pk;
}

export async function updatePractice(practiceId: string, fields: Partial<Practice>) {
  const mutation = `
    mutation UpdatePractice($practiceId: uuid!, $fields: practices_set_input!) {
      update_practices_by_pk(pk_columns: { practice_id: $practiceId }, _set: $fields) {
        practice_id
        practice_name
        email
        phone_number
        photo
        address
        opening_hours
        updated_at
      }
    }
  `;

  try {
    const response = await fetch(HASURA_GRAPHQL_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-hasura-admin-secret": HASURA_ADMIN_SECRET,
      },
      body: JSON.stringify({ query: mutation, variables: { practiceId, fields } }),
    });

    const result = await response.json();

    if (!response.ok || result.errors) {
      throw new Error(result.errors?.[0]?.message || "Error updating practice");
    }

    return result.data.update_practices_by_pk;
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Error updating practice";
    console.error("Error updating practice:", message);
    throw new Error(message);
  }
}

/**
 * Updates the practice settings and, if a new file is provided,
 * uploads it to S3 while deleting the existing photo (if applicable).
 * 
 * - Retrieves existing practice data to maintain other fields.
 * - Uploads a new file if provided, replacing the old photo in S3.
 * - Updates the practice record in the database with new settings.
 * 
 * @param practiceId - The unique identifier of the practice.
 * @param settings - The updated practice settings (partial update).
 * @param file - Optional file for practice photo upload.
 * @returns The updated photo URL or null if unchanged.
 * @throws Error if the practice is not found.
 */
export async function updatePracticeSettingsWithPhoto(
  practiceId: string,
  settings: Partial<Practice>,
  file?: File | null
): Promise<{ photoUrl: string | null }> {
  const existingPractice = await fetchPracticeAndPreferencesById(practiceId);
  if (!existingPractice) {
    throw new Error("Practice not found");
  }

  let photoUrl = existingPractice.photo || null;

  if (file) {
    const arrayBuffer = await file.arrayBuffer();
    const fileBuffer = Buffer.from(arrayBuffer);
    photoUrl = await uploadFileBuffer(fileBuffer, file.name, file.type);

    // If an old photo exists, delete it from S3.
    if (existingPractice.photo) {
      const keyToDelete = extractKeyFromS3Url(existingPractice.photo);
      if (keyToDelete) {
        await deleteFileFromS3(keyToDelete);
      }
    }
  }

  const updatedFields = {
    practice_name: settings.practice_name || existingPractice.practice_name,
    email: settings.email || existingPractice.email,
    phone_number: settings.phone_number || existingPractice.phone_number,
    opening_hours: settings.opening_hours || existingPractice.opening_hours,
    photo: photoUrl,
  };

  await updatePractice(practiceId, updatedFields);
  return { photoUrl };
}

export async function getNearbyPractices(userLat: number, userLon: number, maxDistance: number): Promise<NearbyPractice[]> {
  const query = `
    query GetNearbyPractices($user_lat: float8!, $user_lon: float8!, $max_distance: float8!) {
      get_nearby_practices(
        args: {
          user_lat: $user_lat
          user_lon: $user_lon
          max_distance: $max_distance
        }
        order_by: { distance: asc }
      ) {
        practice_id
        practice_name
        location
        distance
        email
        phone_number
        photo
        address
        opening_hours
        verified
        created_at
        updated_at
        verified_at
      }
    }
  `;

  try {
    const response = await fetch(HASURA_GRAPHQL_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-hasura-admin-secret": HASURA_ADMIN_SECRET,
      },
      body: JSON.stringify({
        query,
        variables: {
          user_lat: userLat,
          user_lon: userLon,
          max_distance: maxDistance,
        },
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error: ${response.status}`);
    }

    const result = await response.json();

    if (result.errors) {
      throw new Error(result.errors[0]?.message || "Failed to fetch nearby practices");
    }

    return result.data.get_nearby_practices;
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to fetch nearby practices";
    console.error("Error fetching nearby practices:", message);
    throw new Error(message);
  }
}