import { NextRequest, NextResponse } from "next/server";
import { approvePractice } from "@/lib/services/practice/practiceService";

export async function POST(req: NextRequest) {
  try {
    const { practiceId } = await req.json();
    if (!practiceId) {
      return NextResponse.json({ error: "Missing practiceId" }, { status: 400 });
    }

    const updatedPractice = await approvePractice(practiceId);
    return NextResponse.json(updatedPractice, { status: 200 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Approving practice failed.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
