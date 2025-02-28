// app/api/appointments/route.ts
import { NextRequest, NextResponse } from "next/server";
import {
  getAppointments,
  createAppointment,
} from "@/lib/services/appointment/appointmentService";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const practiceId = searchParams.get("practiceId") || undefined;
  const startTime = searchParams.get("start_time") || undefined;
  const endTime = searchParams.get("end_time") || undefined;
  const booked = searchParams.get("booked") || undefined;

  try {
    const appointments = await getAppointments({ practiceId, startTime, endTime, booked });
    return NextResponse.json({ appointments });
  } catch (error: unknown) {
    console.error("Error fetching appointments:", error);
    const message = error instanceof Error ? error.message : "Failed to fetch appointments.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const appointment = await createAppointment(body);
    return NextResponse.json({ appointment });
  } catch (error: unknown) {
    console.error("Error creating appointment:", error);
    const message = error instanceof Error ? error.message : "Failed to create appointment.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}