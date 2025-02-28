// app/api/appointments/route.ts
import { NextRequest, NextResponse } from "next/server";
import {
  getUserAppointmentsWithDetails,
} from "@/lib/services/appointment/appointmentService";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("userId") || undefined;

  try {
    if (!userId) {
      return NextResponse.json({ error: "userId is required" }, { status: 400 });
    }

    const appointments = await getUserAppointmentsWithDetails(userId);
    return NextResponse.json({ appointments });
  } catch (error: unknown) {
    console.error("Error fetching appointments:", error);
    const message = error instanceof Error ? error.message : "Failed to fetch appointments.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}