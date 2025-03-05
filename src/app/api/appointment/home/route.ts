import { NextRequest, NextResponse } from "next/server";
import { getNextAppointments } from "@/lib/services/appointment/appointmentService";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const startTime = searchParams.get("startTime") || new Date().toISOString();
    const limit = parseInt(searchParams.get("limit") || "5", 10);
    const appointments = await getNextAppointments({ startTime, limit });
    return NextResponse.json({ appointments });
  } catch (error: unknown) {
    console.error("Error fetching next appointments:", error);
    const message = error instanceof Error ? error.message : "Failed to fetch next appointments.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}