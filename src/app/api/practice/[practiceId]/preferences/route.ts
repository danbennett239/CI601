// app/api/practice/[practiceId]/preferences/route.ts
import { NextResponse } from "next/server";
import { updatePracticePreferences } from "@/lib/services/practiceService";

export async function PUT(request: Request, context: { params: Promise<{ practiceId: string }> }) {
  try {
    const { practiceId } = await context.params;

    if (!practiceId) {
      return NextResponse.json({ error: "Missing practiceId" }, { status: 400 });
    }

    const body = await request.json();
    const { prefs } = body;
    if (prefs === undefined) {
      return NextResponse.json({ error: "Missing preferences" }, { status: 400 });
    }

    const updatedPrefs = await updatePracticePreferences(practiceId, prefs);
    return NextResponse.json({ preferences: updatedPrefs });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Error updating preferences";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

