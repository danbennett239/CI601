import { NextRequest, NextResponse } from "next/server";
import { getTopRatedPractices } from "@/lib/services/practice/practiceService";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "5", 10);

    const practices = await getTopRatedPractices({ limit });
    return NextResponse.json({ practices });
  } catch (error: unknown) {
    console.error("Error fetching top practices:", error);
    const message = error instanceof Error ? error.message : "Failed to fetch top practices.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}