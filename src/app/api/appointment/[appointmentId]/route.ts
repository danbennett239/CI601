// app/api/appointments/[appointmentId/route.ts

import { NextResponse } from 'next/server';
import { getAppointmentById, updateAppointment, deleteAppointment } from '@/lib/services/appointmentService';

export async function GET(request: Request, { params }: { params: { appointmentId: string } }) {
  try {
    const appointment = await getAppointmentById(params.appointmentId);
    return NextResponse.json({ appointment });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to fetch appointment.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: { params: { appointmentId: string } }) {
  try {
    const body = await request.json();
    if (!body) {
      return NextResponse.json({ error: "Request body is missing" }, { status: 400 });
    }
    const appointment = await updateAppointment(params.appointmentId, body);
    return NextResponse.json({ appointment });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to update appointment.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: { appointmentId: string } }) {
  try {
    await deleteAppointment(params.appointmentId);
    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to delete appointment.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
