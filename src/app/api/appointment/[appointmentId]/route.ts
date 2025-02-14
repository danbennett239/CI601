import { NextRequest, NextResponse } from 'next/server';
import { getAppointmentById, updateAppointment, deleteAppointment } from '@/lib/services/appointmentService';

// Define a type for route parameters
interface Params {
  appointmentId: string;
}

export async function GET(request: NextRequest, context: { params: Params }) {
  try {
    const appointment = await getAppointmentById(context.params.appointmentId);
    return NextResponse.json({ appointment });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to fetch appointment.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, context: { params: Params }) {
  try {
    const body = await request.json();
    if (!body) {
      return NextResponse.json({ error: "Request body is missing" }, { status: 400 });
    }

    const appointment = await updateAppointment(context.params.appointmentId, body);
    return NextResponse.json({ appointment });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to update appointment.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, context: { params: Params }) {
  try {
    await deleteAppointment(context.params.appointmentId);
    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to delete appointment.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
