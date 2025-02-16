import { NextResponse } from "next/server";
import { validateOpeningHours } from "@/lib/services/practiceService";

export async function POST(request: Request, context: { params: Promise<{ practiceId: string }> }) {
  try {
    const { practiceId } = await context.params;

    if (!practiceId) {
      return NextResponse.json({ error: "Missing practiceId" }, { status: 400 });
    }

    const body = await request.json();
    const { opening_hours } = body;
    if (!opening_hours) {
      return NextResponse.json({ error: "Missing opening_hours" }, { status: 400 });
    }

    await validateOpeningHours(practiceId, opening_hours);
    return NextResponse.json({ valid: true });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Error validating opening hours";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

