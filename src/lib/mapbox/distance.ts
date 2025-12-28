import { HOME_BASES, SERVICE_RADIUS_MILES } from './constants';

/**
 * Calculate great-circle distance between two points using Haversine formula
 * @param coord1 [lng, lat]
 * @param coord2 [lng, lat]
 * @returns distance in miles
 */
export function calculateDistance(
  coord1: [number, number],
  coord2: [number, number]
): number {
  const R = 3958.8; // Earth radius in miles
  const lat1 = (coord1[1] * Math.PI) / 180;
  const lat2 = (coord2[1] * Math.PI) / 180;
  const dLat = lat2 - lat1;
  const dLon = ((coord2[0] - coord1[0]) * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

/**
 * Find the nearest home base and return distance to it
 * @param coordinates [lng, lat]
 * @returns Object with distance (in miles, rounded to 1 decimal) and base index
 */
export function getNearestHomeBase(
  coordinates: [number, number]
): { distance: number; baseIndex: number; baseName: string } {
  let minDistance = Infinity;
  let nearestIndex = 0;

  HOME_BASES.forEach((base, idx) => {
    const distance = calculateDistance(coordinates, base.coordinates);
    if (distance < minDistance) {
      minDistance = distance;
      nearestIndex = idx;
    }
  });

  return {
    distance: Math.round(minDistance * 10) / 10, // Round to 1 decimal place
    baseIndex: nearestIndex,
    baseName: HOME_BASES[nearestIndex].name,
  };
}

/**
 * Check if coordinates are within service area
 * @param coordinates [lng, lat]
 * @returns true if within service radius
 */
export function isWithinServiceArea(coordinates: [number, number]): boolean {
  const { distance } = getNearestHomeBase(coordinates);
  return distance <= SERVICE_RADIUS_MILES;
}

/**
 * Generate a GeoJSON circle polygon for map rendering
 * @param center [lng, lat]
 * @param radiusMiles radius in miles
 * @param points number of points to generate (default 64 for smooth circle)
 * @returns GeoJSON Feature with Polygon geometry
 */
export function createCircle(
  center: [number, number],
  radiusMiles: number,
  points: number = 64
): GeoJSON.Feature<GeoJSON.Polygon> {
  const coords = {
    latitude: center[1],
    longitude: center[0],
  };

  const km = radiusMiles * 1.60934; // Convert miles to km
  const ret: [number, number][] = [];
  const distanceX = km / (111.32 * Math.cos((coords.latitude * Math.PI) / 180));
  const distanceY = km / 110.574;

  for (let i = 0; i < points; i++) {
    const theta = (i / points) * (2 * Math.PI);
    const x = distanceX * Math.cos(theta);
    const y = distanceY * Math.sin(theta);
    ret.push([coords.longitude + x, coords.latitude + y]);
  }
  ret.push(ret[0]); // Close the polygon

  return {
    type: 'Feature',
    geometry: {
      type: 'Polygon',
      coordinates: [ret],
    },
    properties: {},
  };
}
