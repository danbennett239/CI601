import { hashPassword } from "@/lib/utils/auth";

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
  ) {
    insert_practices_one(
      object: {
        practice_name: $practice_name,
        email: $email,
        phone_number: $phone_number,
        photo: $photo,
        address: $address,
        opening_hours: $opening_hours,
        verified: false
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

export async function createPracticeWithUser({
  practiceName,
  email,
  password,
  phoneNumber,
  photo,
  address,
  openingHours,
}: {
  practiceName: string;
  email: string;
  password: string;
  phoneNumber?: string;
  photo?: string;
  address: Record<string, string>;
  openingHours: Array<{ dayName: string; open: string; close: string }>;
}) {
  try {
    const hashedPassword = await hashPassword(password);

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
        },
      }),
    });

    const result = await response.json();

    if (!response.ok || result.errors) {
      throw new Error(result.errors?.[0]?.message || "Practice registration failed.");
    }

    return {
      practice_id: result.data.insert_practices_one.practice_id,
      practice_name: result.data.insert_practices_one.practice_name,
      user: result.data.insert_practices_one.users[0],
    };
  } catch (error) {
    console.error("Practice Registration Error:", error);
    throw new Error("Practice registration failed. Please try again.");
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