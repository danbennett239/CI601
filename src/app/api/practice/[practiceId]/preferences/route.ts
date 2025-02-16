// app/api/practice/[practiceId]/preferences/route.ts
import { NextResponse } from "next/server";
import { updatePracticePreferences } from "@/lib/services/practiceService";

interface Context {
  params: { practiceId: string };
}

export async function PUT(request: Request, { params }: Context) {
  const practiceId = params.practiceId;
  if (!practiceId) {
    return NextResponse.json({ error: "Missing practiceId" }, { status: 400 });
  }
  try {
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
