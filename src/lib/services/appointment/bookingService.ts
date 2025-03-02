import { sendEmail } from "@/lib/services/email/emailService";
import { BookingAppointment } from "@/types/appointment";

const HASURA_GRAPHQL_URL = process.env.HASURA_GRAPHQL_URL!;
const HASURA_ADMIN_SECRET = process.env.HASURA_ADMIN_SECRET!;

export async function bookAppointment(appointmentId: string, userId: string, userEmail: string): Promise<BookingAppointment> {
  const mutation = `
    mutation BookAppointment($appointmentId: uuid!, $userId: uuid!) {
      update_appointments_by_pk(
        pk_columns: { appointment_id: $appointmentId },
        _set: { booked: true, user_id: $userId }
      ) {
        appointment_id
        practice_id
        title
        start_time
        end_time
        booked
        practice {
          practice_name
          email
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
        query: mutation,
        variables: { appointmentId, userId },
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error: ${response.status}`);
    }

    const result = await response.json();
    if (result.errors) {
      throw new Error(result.errors[0]?.message || "Failed to book appointment");
    }

    const appointment: BookingAppointment = result.data.update_appointments_by_pk;

    const practiceEmail = appointment.practice.email;
    const subject = "Appointment Confirmation";

    const userText = `
      Dear User,
      Your appointment with ${appointment.practice.practice_name} is confirmed:
      - Service: ${appointment.title}
      - Date & Time: ${new Date(appointment.start_time).toLocaleString()}
      Thank you for booking with us!
    `;
    const userHtml = `
      <p>Dear User,</p>
      <p>Your appointment with <strong>${appointment.practice.practice_name}</strong> is confirmed:</p>
      <ul>
        <li><strong>Service:</strong> ${appointment.title}</li>
        <li><strong>Date & Time:</strong> ${new Date(appointment.start_time).toLocaleString()}</li>
      </ul>
      <p>Thank you for booking with us!</p>
    `;

    const practiceText = `
      Dear ${appointment.practice.practice_name},
      A user has booked an appointment:
      - Service: ${appointment.title}
      - Date & Time: ${new Date(appointment.start_time).toLocaleString()}
      Please prepare accordingly.
    `;
    const practiceHtml = `
      <p>Dear ${appointment.practice.practice_name},</p>
      <p>A user has booked an appointment:</p>
      <ul>
        <li><strong>Service:</strong> ${appointment.title}</li>
        <li><strong>Date & Time:</strong> ${new Date(appointment.start_time).toLocaleString()}</li>
      </ul>
      <p>Please prepare accordingly.</p>
    `;

    await Promise.all([
      sendEmail({
        to: userEmail,
        subject,
        textPart: userText,
        htmlPart: userHtml,
      }),
      sendEmail({
        to: practiceEmail,
        subject,
        textPart: practiceText,
        htmlPart: practiceHtml,
      }),
    ]);

    return appointment;
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to book appointment";
    console.error("Error in bookAppointment:", message);
    throw new Error(message);
  }
}