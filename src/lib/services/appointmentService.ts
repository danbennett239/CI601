// lib/services/appointmentService.ts
import { Appointment } from '@/types/practice';

const HASURA_GRAPHQL_URL = process.env.HASURA_GRAPHQL_URL!;
const HASURA_ADMIN_SECRET = process.env.HASURA_ADMIN_SECRET!;

export async function getAppointments(filters: { 
  practiceId?: string; 
  start_time?: string; 
  end_time?: string; 
  booked?: string;
}) {
  const query = `
    query GetAppointments($practiceId: uuid, $start_time: timestamp, $end_time: timestamp, $booked: Boolean) {
      appointments(where: {
         practice_id: { _eq: $practiceId },
         start_time: { _gte: $start_time },
         end_time: { _lte: $end_time },
         ${filters.booked !== undefined ? `booked: { _eq: $booked }` : ""}
      }) {
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

  const variables: Record<string, any> = {
    practiceId: filters.practiceId,
    start_time: filters.start_time,
    end_time: filters.end_time,
  };

  // Only add `booked` if it's explicitly true or false
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

export async function createAppointment(appointment: { 
  practice_id: string; 
  title: string; 
  start_time: string; 
  end_time: string; 
}) {
  const mutation = `
    mutation CreateAppointment($appointment: appointments_insert_input!) {
      insert_appointments_one(object: $appointment) {
         appointment_id
         practice_id
         title
         start_time
         end_time
         booked
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
      body: JSON.stringify({ query: mutation, variables: { appointment } }),
    });
    const result = await response.json();
    if (!response.ok || result.errors) {
      throw new Error(result.errors?.[0]?.message || "Error creating appointment");
    }
    return result.data.insert_appointments_one;
  } catch (error: unknown) {
    console.error("Error in createAppointment:", error);
    const message = error instanceof Error ? error.message : "Error creating appointment";
    throw new Error(message);
  }
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
