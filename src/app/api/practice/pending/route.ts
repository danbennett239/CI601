import { NextResponse } from "next/server";
import { fetchPendingDentalPractices } from "@/lib/services/practice/practiceService";

export async function GET() {
  try {
    const practices = await fetchPendingDentalPractices();
    return NextResponse.json(practices, { status: 200 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Fetching pending practices failed.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
