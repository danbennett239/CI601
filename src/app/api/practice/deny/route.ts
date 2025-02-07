import { NextRequest, NextResponse } from "next/server";
import { denyPractice } from "@/lib/services/practiceService";

export async function POST(req: NextRequest) {
  try {
    const { practiceId } = await req.json();
    if (!practiceId) {
      return NextResponse.json({ error: "Missing practiceId" }, { status: 400 });
    }

    const deletedPractice = await denyPractice(practiceId);
    return NextResponse.json(deletedPractice, { status: 200 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Denying practice failed.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
