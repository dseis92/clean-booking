// Home base locations for distance calculation
export const HOME_BASES = [
  { zip: '54481', name: 'Schofield', coordinates: [-89.6065, 44.9058] as [number, number] },
  { zip: '54482', name: 'Rothschild', coordinates: [-89.6279, 44.8853] as [number, number] },
  { zip: '54492', name: 'Weston', coordinates: [-89.5465, 44.8908] as [number, number] },
] as const;

// Service area configuration
export const SERVICE_RADIUS_MILES = 50;

// Mapbox map styling
export const MAPBOX_STYLE = 'mapbox://styles/mapbox/light-v11';

// Default map center (between the three home bases)
export const DEFAULT_MAP_CENTER: [number, number] = [-89.569710, 44.523472];
export const DEFAULT_MAP_ZOOM = 8;

// Mapbox token from environment
export const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

if (!MAPBOX_TOKEN && typeof window !== 'undefined') {
  console.warn('⚠️ NEXT_PUBLIC_MAPBOX_TOKEN is not set. Get a token from mapbox.com');
}
