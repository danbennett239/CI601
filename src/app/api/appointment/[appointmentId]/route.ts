import { NextRequest, NextResponse } from 'next/server';
import {
  getAppointmentById,
  updateAppointment,
  deleteAppointment,
} from '@/lib/services/appointmentService';

// Define the type for the route parameters
interface AppointmentParams {
  appointmentId: string;
}

export async function GET(
  request: NextRequest,
  { params }: { params: AppointmentParams }
) {
  try {
    const appointment = await getAppointmentById(params.appointmentId);
    return NextResponse.json({ appointment });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : 'Failed to fetch appointment.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: AppointmentParams }
) {
  try {
    const body = await request.json();
    if (!body) {
      return NextResponse.json({ error: 'Request body is missing' }, { status: 400 });
    }

    const appointment = await updateAppointment(params.appointmentId, body);
    return NextResponse.json({ appointment });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : 'Failed to update appointment.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: AppointmentParams }
) {
  try {
    await deleteAppointment(params.appointmentId);
    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : 'Failed to delete appointment.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
