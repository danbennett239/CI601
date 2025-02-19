// app/api/appointments/route.ts
import { NextResponse } from 'next/server';
import { getAppointments, createAppointment } from '@/lib/services/appointment/appointmentService';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const practiceId = searchParams.get('practiceId') || undefined;
  const start_time = searchParams.get('start_time') || undefined;
  const end_time = searchParams.get('end_time') || undefined;
  const booked = searchParams.get('booked') || undefined;
  try {
    const appointments = await getAppointments({ practiceId, start_time, end_time, booked });
    return NextResponse.json({ appointments });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to fetch appointments.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const appointment = await createAppointment(body);
    return NextResponse.json({ appointment });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to create appointment.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
