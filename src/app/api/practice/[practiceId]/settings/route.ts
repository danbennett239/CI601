import { NextResponse } from "next/server";
import { updatePracticeSettings } from "@/lib/services/practice/practiceService";

export async function PUT(request: Request, context: { params: Promise<{ practiceId: string }> }) {
  try {
    const { practiceId } = await context.params;

    if (!practiceId) {
      return NextResponse.json({ error: "Missing practiceId" }, { status: 400 });
    }

    const body = await request.json();
    const { settings } = body;
    if (!settings) {
      return NextResponse.json({ error: "Missing settings" }, { status: 400 });
    }

    const updatedSettings = await updatePracticeSettings(practiceId, settings);
    return NextResponse.json({ settings: updatedSettings });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Error updating practice settings";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

