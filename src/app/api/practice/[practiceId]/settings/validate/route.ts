import { NextResponse } from "next/server";
import { validateOpeningHours } from "@/lib/services/practiceService";

interface Context {
  params: { practiceId: string };
}

// POST /api/practice/[practiceId]/settings/validate
export async function POST(request: Request, { params }: Context) {
  const practiceId = params.practiceId;
  if (!practiceId) {
    return NextResponse.json({ error: "Missing practiceId" }, { status: 400 });
  }
  try {
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
