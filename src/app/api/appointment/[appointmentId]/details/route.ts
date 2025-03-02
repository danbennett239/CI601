import { NextRequest, NextResponse } from "next/server";
import { getAppointmentWithPracticeByAppId } from "@/lib/services/appointment/appointmentService";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ appointmentId: string }> }
) {
  try {
    const { appointmentId } = await context.params;
    if (!appointmentId) {
      return NextResponse.json({ error: "Missing appointmentId" }, { status: 400 });
    }

    const appointment = await getAppointmentWithPracticeByAppId(appointmentId);
    if (!appointment) {
      return NextResponse.json({ error: "Appointment not found" }, { status: 404 });
    }

    return NextResponse.json({ appointment });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to fetch appointment details";
    console.error("Error in appointment details route:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}