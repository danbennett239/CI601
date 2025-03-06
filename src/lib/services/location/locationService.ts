const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY!;

export interface Coordinates {
  latitude: number;
  longitude: number;
}

// Geocode postcode to lat/long using Google Maps API
export async function geocodePostcode(postcode: string): Promise<Coordinates> {
  const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(postcode)}&key=${GOOGLE_MAPS_API_KEY}`;
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error: ${response.status}`);
    }
    const data = await response.json();
    if (data.status !== 'OK' || !data.results[0]) {
      throw new Error('Invalid postcode or no results found');
    }
    const { lat, lng } = data.results[0].geometry.location;
    return { latitude: lat, longitude: lng }; // Matches Coordinates interface
  } catch (error: unknown) {
    console.error('Error geocoding postcode:', error);
    throw new Error(error instanceof Error ? error.message : 'Failed to geocode postcode');
  }
}