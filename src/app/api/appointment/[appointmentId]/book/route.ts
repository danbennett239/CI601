import { NextRequest, NextResponse } from "next/server";
import { bookAppointment } from "@/lib/services/appointment/bookingService";

interface Appointment {
  appointment_id: string;
  practice_id: string;
  title: string;
  start_time: string;
  end_time: string;
  booked: boolean;
  practice: {
    practice_name: string;
    email: string;
  };
}

interface BookingRequestBody {
  userId: string;
  email: string;
}

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ appointmentId: string }> }
) {
  try {
    const { appointmentId } = await context.params;
    const { userId, email } = (await request.json()) as BookingRequestBody;

    if (!userId || !email) {
      return NextResponse.json({ error: "Missing userId or email" }, { status: 400 });
    }

    const appointment: Appointment = await bookAppointment(appointmentId, userId, email);
    return NextResponse.json({ message: "Booking confirmed", appointment }, { status: 200 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to book appointment";
    console.error("Error in booking route:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}