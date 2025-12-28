/**
 * Mapbox Geocoding API client for address search and autocomplete
 */

export interface GeocodingResult {
  id: string;
  place_name: string;
  center: [number, number]; // [lng, lat]
  place_type: string[];
  text: string;
  context?: Array<{
    id: string;
    short_code?: string;
    text: string;
  }>;
}

/**
 * Search for addresses using Mapbox Geocoding API
 * @param query Search query (address text)
 * @param accessToken Mapbox public access token
 * @returns Array of geocoding results
 */
export async function searchAddress(
  query: string,
  accessToken: string
): Promise<GeocodingResult[]> {
  // Don't search for very short queries
  if (query.trim().length < 3) {
    return [];
  }

  try {
    const endpoint = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
      query
    )}.json`;

    const params = new URLSearchParams({
      access_token: accessToken,
      country: 'US', // Restrict to United States
      types: 'address,place', // Only addresses and places (cities)
      limit: '5', // Return top 5 results
      autocomplete: 'true', // Enable autocomplete mode
      proximity: '-89.5,44.5', // Bias results toward Wisconsin
    });

    const response = await fetch(`${endpoint}?${params}`);

    if (!response.ok) {
      throw new Error(`Geocoding API error: ${response.status}`);
    }

    const data = await response.json();
    return data.features || [];
  } catch (error) {
    console.error('Geocoding error:', error);
    throw error;
  }
}

/**
 * Format a geocoding result for display in autocomplete dropdown
 * @param result Geocoding result
 * @returns Formatted address string
 */
export function formatAddressDisplay(result: GeocodingResult): string {
  return result.place_name;
}

/**
 * Get state abbreviation from geocoding result context
 * @param result Geocoding result
 * @returns State abbreviation (e.g., "WI") or undefined
 */
export function getStateFromResult(result: GeocodingResult): string | undefined {
  if (!result.context) return undefined;

  const regionContext = result.context.find((ctx) =>
    ctx.id.startsWith('region.')
  );

  return regionContext?.short_code?.replace('US-', '');
}
