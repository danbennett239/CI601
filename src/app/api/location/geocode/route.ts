import { NextRequest, NextResponse } from 'next/server';
import { geocodePostcode, Coordinates } from '@/lib/services/location/locationService';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const postcode = searchParams.get('postcode');

  if (!postcode) {
    return NextResponse.json({ error: 'Postcode is required' }, { status: 400 });
  }

  try {
    const coords: Coordinates = await geocodePostcode(postcode);
    return NextResponse.json(coords);
  } catch (error: unknown) {
    console.error('Error in geocode route:', error);
    const message = error instanceof Error ? error.message : 'Failed to geocode postcode';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}