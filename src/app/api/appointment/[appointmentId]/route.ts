// app/api/appointments/[appointmentId/route.ts

import { NextResponse } from 'next/server';
import { getAppointmentById, updateAppointment, deleteAppointment } from '@/lib/services/appointmentService';

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const appointment = await getAppointmentById(params.id);
    return NextResponse.json({ appointment });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to fetch appointment.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const body = await request.json();
    const appointment = await updateAppointment(params.id, body);
    return NextResponse.json({ appointment });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to update appointment.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    await deleteAppointment(params.id);
    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to delete appointment.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
