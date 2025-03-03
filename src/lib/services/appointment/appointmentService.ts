import { Appointment } from '@/types/practice';
import { AppointmentWithPractice } from '@/types/appointment';

const HASURA_GRAPHQL_URL = process.env.HASURA_GRAPHQL_URL!;
const HASURA_ADMIN_SECRET = process.env.HASURA_ADMIN_SECRET!;

export async function getAppointments(filters: {
  practiceId?: string;
  startTime?: string;
  endTime?: string;
  booked?: string;
}) {
  const query = `
    query GetAppointments($practiceId: uuid, $startTime: timestamp, $endTime: timestamp, $booked: Boolean) {
      appointments(where: {
         practice_id: { _eq: $practiceId },
         start_time: { _gte: $startTime },
         end_time: { _lte: $endTime },
         ${filters.booked !== undefined ? `booked: { _eq: $booked }` : ""}
      }) {
         appointment_id
         practice_id
         user_id
         title
         start_time
         end_time
         booked
         services
         booked_service
         created_at
         updated_at
      }
    }
  `;

  const variables: {
    practiceId?: string;
    startTime?: string;
    endTime?: string;
    booked?: boolean;
  } = {
    practiceId: filters.practiceId,
    startTime: filters.startTime,
    endTime: filters.endTime,
  };

  if (filters.booked !== undefined) {
    variables.booked = filters.booked === "true";
  }

  try {
    const response = await fetch(HASURA_GRAPHQL_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-hasura-admin-secret": HASURA_ADMIN_SECRET,
      },
      body: JSON.stringify({ query, variables }),
    });
    const result = await response.json();
    if (!response.ok || result.errors) {
      throw new Error(result.errors?.[0]?.message || "Error fetching appointments");
    }
    return result.data.appointments;
  } catch (error: unknown) {
    console.error("Error in getAppointments:", error);
    const message = error instanceof Error ? error.message : "Error fetching appointments";
    throw new Error(message);
  }
}


export async function getAppointmentById(appointmentId: string) {
  const query = `
    query GetAppointment($appointmentId: uuid!) {
      appointments_by_pk(appointment_id: $appointmentId) {
         appointment_id
         practice_id
         user_id
         title
         start_time
         end_time
         booked
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
      body: JSON.stringify({ query, variables: { appointmentId } }),
    });
    const result = await response.json();
    if (!response.ok || result.errors) {
      throw new Error(result.errors?.[0]?.message || "Error fetching appointment");
    }
    return result.data.appointments_by_pk;
  } catch (error: unknown) {
    console.error("Error in getAppointmentById:", error);
    const message = error instanceof Error ? error.message : "Error fetching appointment";
    throw new Error(message);
  }
}

export async function getUserAppointmentsWithDetails(userId: string) {
  const query = `
    query GetAppointmentsAndReviews($userId: uuid!) {
      appointments(where: { user_id: { _eq: $userId } }) {
        appointment_id
        practice_id
        user_id
        title
        start_time
        end_time
        booked
        created_at
        updated_at
        practice {
          practice_name
          email
          phone_number
          photo
          address
          opening_hours
        }
        practice_review {
          review_id
          rating
          comment
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
      body: JSON.stringify({ query, variables: { userId } }),
    });
    const result = await response.json();
    if (!response.ok || result.errors) {
      throw new Error(result.errors?.[0]?.message || "Error fetching appointments and reviews");
    }
    return result.data.appointments;
  } catch (error: unknown) {
    console.error("Error in getAppointmentsAndReviews:", error);
    const message = error instanceof Error ? error.message : "Error fetching appointments and reviews";
    throw new Error(message);
  }
}

export async function createAppointment(data: {
  practice_id: string;
  title?: string;
  start_time: string;
  end_time: string;
  services: Record<string, number>;
}) {
  const { practice_id, title, start_time, end_time, services } = data;

  const mutation = `
    mutation CreateAppointment(
      $practice_id: uuid!,
      $title: String,
      $start_time: timestamp!,
      $end_time: timestamp!,
      $services: jsonb!
    ) {
      insert_appointments_one(object: {
        practice_id: $practice_id,
        title: $title,
        start_time: $start_time,
        end_time: $end_time,
        services: $services,
      }) {
        appointment_id
        practice_id
        title
        start_time
        end_time
        services
        booked_service
        created_at
        updated_at
      }
    }
  `;

  const response = await fetch(HASURA_GRAPHQL_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-hasura-admin-secret": HASURA_ADMIN_SECRET,
    },
    body: JSON.stringify({
      query: mutation,
      variables: { practice_id, title, start_time, end_time, services },
    }),
  });

  const result = await response.json();
  if (!response.ok || result.errors) {
    throw new Error(result.errors?.[0]?.message || "Failed to create appointment");
  }

  return result.data.insert_appointments_one;
}

export async function updateAppointment(appointmentId: string, appointment: Partial<Appointment>) {
  const mutation = `
    mutation UpdateAppointment($appointmentId: uuid!, $appointment: appointments_set_input!) {
      update_appointments_by_pk(pk_columns: { appointment_id: $appointmentId }, _set: $appointment) {
         appointment_id
         practice_id
         user_id
         title
         start_time
         end_time
         booked
         services
         booked_service
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
      body: JSON.stringify({ query: mutation, variables: { appointmentId, appointment } }),
    });
    const result = await response.json();
    if (!response.ok || result.errors) {
      throw new Error(result.errors?.[0]?.message || "Error updating appointment");
    }
    return result.data.update_appointments_by_pk;
  } catch (error: unknown) {
    console.error("Error in updateAppointment:", error);
    const message = error instanceof Error ? error.message : "Error updating appointment";
    throw new Error(message);
  }
}

export async function deleteAppointment(appointmentId: string) {
  const mutation = `
    mutation DeleteAppointment($appointmentId: uuid!) {
      delete_appointments_by_pk(appointment_id: $appointmentId) {
         appointment_id
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
      body: JSON.stringify({ query: mutation, variables: { appointmentId } }),
    });
    const result = await response.json();
    if (!response.ok || result.errors) {
      throw new Error(result.errors?.[0]?.message || "Error deleting appointment");
    }
    return result.data.delete_appointments_by_pk;
  } catch (error: unknown) {
    console.error("Error in deleteAppointment:", error);
    const message = error instanceof Error ? error.message : "Error deleting appointment";
    throw new Error(message);
  }
}

export async function getAppointmentWithPracticeByAppId(appointmentId: string): Promise<AppointmentWithPractice> {
  const query = `
    query GetAppointmentWithPractice($appointmentId: uuid!) {
      appointments_by_pk(appointment_id: $appointmentId) {
        appointment_id
        practice_id
        user_id
        title
        start_time
        end_time
        booked
        created_at
        updated_at
        practice {
          practice_name
          email
          phone_number
          photo
          address
          opening_hours
          practice_reviews_aggregate {
            aggregate {
              avg {
                rating
              }
              count
            }
          }
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
      body: JSON.stringify({
        query,
        variables: { appointmentId },
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error: ${response.status}`);
    }

    const result = await response.json();
    if (result.errors) {
      throw new Error(result.errors[0]?.message || "Error fetching appointment with practice details");
    }

    return result.data.appointments_by_pk;
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Error fetching appointment with practice details";
    console.error("Error in getAppointmentWithPracticeByAppId:", message);
    throw new Error(message);
  }
}