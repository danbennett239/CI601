import { NextRequest, NextResponse } from "next/server";
import { searchAppointments } from "@/lib/services/appointment/appointmentService";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const filters = {
    userLat: searchParams.get("lat") ? parseFloat(searchParams.get("lat")!) : undefined,
    userLon: searchParams.get("lon") ? parseFloat(searchParams.get("lon")!) : undefined,
    maxDistance: searchParams.get("maxDistance") ? parseFloat(searchParams.get("maxDistance")!) : undefined,
    limit: searchParams.get("limit") ? parseInt(searchParams.get("limit")!, 10) : undefined,
    offset: searchParams.get("offset") ? parseInt(searchParams.get("offset")!, 10) : undefined,
    appointmentType: searchParams.get("appointmentType")?.trim() || undefined,
    priceMin: searchParams.get("priceMin") ? parseFloat(searchParams.get("priceMin")!) : undefined,
    priceMax: searchParams.get("priceMax") ? parseFloat(searchParams.get("priceMax")!) : undefined,
    dateStart: searchParams.get("dateStart") || undefined,
    dateEnd: searchParams.get("dateEnd") || undefined,
    sortBy: searchParams.get("sortBy") as "lowest_price" | "highest_price" | "closest" | "soonest" | undefined,
  };

  try {
    const appointments = await searchAppointments(filters);
    return NextResponse.json({ appointments });
  } catch (error: unknown) {
    console.error("Error searching appointments:", error);
    const message = error instanceof Error ? error.message : "Failed to search appointments";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}