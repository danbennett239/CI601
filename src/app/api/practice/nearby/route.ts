import { NextRequest, NextResponse } from "next/server";
import { getNearbyPractices } from "@/lib/services/practice/practiceService";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const userLat = searchParams.get("userLat");
  const userLon = searchParams.get("userLon");
  const maxDistance = searchParams.get("maxDistance") || "50"; // Default to 50 km

  if (!userLat || !userLon) {
    return NextResponse.json({ error: "Missing userLat or userLon" }, { status: 400 });
  }

  try {
    const practices = await getNearbyPractices(
      parseFloat(userLat),
      parseFloat(userLon),
      parseFloat(maxDistance)
    );
    return NextResponse.json({ practices });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to fetch nearby practices";
    console.error("Error in nearby practices route:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}