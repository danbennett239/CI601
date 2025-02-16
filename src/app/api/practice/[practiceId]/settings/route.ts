import { NextResponse } from "next/server";
import { updatePracticeSettings } from "@/lib/services/practiceService";

interface Context {
  params: { practiceId: string };
}

// PUT /api/practice/[practiceId]/settings
export async function PUT(request: Request, { params }: Context) {
  const practiceId = params.practiceId;
  if (!practiceId) {
    return NextResponse.json({ error: "Missing practiceId" }, { status: 400 });
  }
  try {
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
