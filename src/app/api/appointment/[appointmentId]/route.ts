import { NextRequest, NextResponse } from 'next/server';
import {
  getAppointmentById,
  updateAppointment,
  deleteAppointment,
} from '@/lib/services/appointment/appointmentService';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ appointmentId: string }> }
) {
  try {
    const { appointmentId } = await context.params; // Await params
    if (!appointmentId) {
      return NextResponse.json({ error: 'Missing appointmentId' }, { status: 400 });
    }

    const appointment = await getAppointmentById(appointmentId);
    return NextResponse.json({ appointment });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : 'Failed to fetch appointment.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ appointmentId: string }> }
) {
  try {
    const { appointmentId } = await context.params;
    if (!appointmentId) {
      return NextResponse.json({ error: 'Missing appointmentId' }, { status: 400 });
    }

    const body = await request.json();
    if (!body) {
      return NextResponse.json({ error: 'Request body is missing' }, { status: 400 });
    }

    const appointment = await updateAppointment(appointmentId, body);
    return NextResponse.json({ appointment });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : 'Failed to update appointment.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ appointmentId: string }> }
) {
  try {
    const { appointmentId } = await context.params;
    if (!appointmentId) {
      return NextResponse.json({ error: 'Missing appointmentId' }, { status: 400 });
    }

    await deleteAppointment(appointmentId);
    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : 'Failed to delete appointment.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
