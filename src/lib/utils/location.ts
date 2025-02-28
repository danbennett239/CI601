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
    if (data.status !== "OK" || !data.results[0]) {
      throw new Error("Invalid postcode or no results found");
    }
    const { lat, lng } = data.results[0].geometry.location;
    return { latitude: lat, longitude: lng };
  } catch (error: unknown) {
    console.error("Error geocoding postcode:", error);
    throw new Error (error instanceof Error ? error.message : "Failed to geocode postcode");
  }
}

// Format coordinates as GeoJSON Point for Hasura/PostGIS
export function toGeoJSONPoint(coords: Coordinates): { type: string; coordinates: [number, number] } {
  return {
    type: "Point",
    coordinates: [coords.longitude, coords.latitude], // [longitude, latitude] per GeoJSON spec
  };
}

// Haversine formula to calculate distance between two points (in kilometers)
// Note: This is for frontend use; we'll use PostGIS ST_Distance on the DB side
export function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}