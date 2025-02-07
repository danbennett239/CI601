import { NextResponse } from "next/server";
import { fetchApprovedDentalPractices } from "@/lib/services/practiceService";

export async function GET() {
  try {
    const practices = await fetchApprovedDentalPractices();
    return NextResponse.json(practices, { status: 200 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Fetching approved practices failed.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
