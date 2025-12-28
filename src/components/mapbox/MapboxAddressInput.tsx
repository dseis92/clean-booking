"use client";

import { useEffect, useRef, useState, useCallback } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { searchAddress, type GeocodingResult } from '@/lib/mapbox/geocoding';
import { getNearestHomeBase, createCircle, isWithinServiceArea } from '@/lib/mapbox/distance';
import {
  MAPBOX_TOKEN,
  MAPBOX_STYLE,
  DEFAULT_MAP_CENTER,
  DEFAULT_MAP_ZOOM,
  HOME_BASES,
  SERVICE_RADIUS_MILES,
} from '@/lib/mapbox/constants';

interface MapboxAddressInputProps {
  value: string;
  distance: number;
  onAddressChange: (address: string, coordinates: [number, number] | null) => void;
  onDistanceChange: (miles: number) => void;
  className?: string;
}

export function MapboxAddressInput({
  value,
  distance,
  onAddressChange,
  onDistanceChange,
  className = '',
}: MapboxAddressInputProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const markerRef = useRef<mapboxgl.Marker | null>(null);

  const [inputValue, setInputValue] = useState(value);
  const [results, setResults] = useState<GeocodingResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedCoords, setSelectedCoords] = useState<[number, number] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);

  // Debounced search function
  const searchTimeoutRef = useRef<NodeJS.Timeout>();

  const performSearch = useCallback(async (query: string) => {
    if (!MAPBOX_TOKEN || query.trim().length < 3) {
      setResults([]);
      return;
    }

    setIsSearching(true);
    setError(null);

    try {
      const searchResults = await searchAddress(query, MAPBOX_TOKEN);
      setResults(searchResults);
      setShowDropdown(searchResults.length > 0);
    } catch (err) {
      console.error('Search error:', err);
      setError('Unable to search addresses. Please try again.');
      setResults([]);
    } finally {
      setIsSearching(false);
    }
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    setShowDropdown(true);

    // Clear previous timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    // Debounce search by 300ms
    searchTimeoutRef.current = setTimeout(() => {
      performSearch(newValue);
    }, 300);
  };

  const handleSelectResult = (result: GeocodingResult) => {
    const coordinates: [number, number] = result.center;
    setInputValue(result.place_name);
    setSelectedCoords(coordinates);
    setShowDropdown(false);
    setResults([]);

    // Calculate distance to nearest home base
    const { distance: calculatedDistance, baseName } = getNearestHomeBase(coordinates);
    const withinArea = isWithinServiceArea(coordinates);

    // Update parent component
    onAddressChange(result.place_name, coordinates);
    onDistanceChange(calculatedDistance);

    // Show error if outside service area
    if (!withinArea) {
      setError(
        `This address is ${calculatedDistance} miles from ${baseName} (max: ${SERVICE_RADIUS_MILES} mi)`
      );
    } else {
      setError(null);
    }

    // Update map marker
    if (mapRef.current && markerRef.current) {
      markerRef.current.setLngLat(coordinates);

      // Change marker color based on service area
      const markerElement = markerRef.current.getElement();
      markerElement.style.background = withinArea
        ? 'linear-gradient(135deg, #14b89a 0%, #22d3bd 100%)'
        : '#ef4444';

      // Fly to location
      mapRef.current.flyTo({
        center: coordinates,
        zoom: 12,
        duration: 1500,
      });
    }
  };

  // Initialize map
  useEffect(() => {
    if (!mapContainerRef.current || !MAPBOX_TOKEN || mapRef.current) return;

    mapboxgl.accessToken = MAPBOX_TOKEN;

    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: MAPBOX_STYLE,
      center: DEFAULT_MAP_CENTER,
      zoom: DEFAULT_MAP_ZOOM,
    });

    map.on('load', () => {
      // Add service area circles for each home base
      HOME_BASES.forEach((base, idx) => {
        const circleData = createCircle(base.coordinates, SERVICE_RADIUS_MILES);

        map.addSource(`service-area-${idx}`, {
          type: 'geojson',
          data: circleData,
        });

        // Fill layer
        map.addLayer({
          id: `service-area-fill-${idx}`,
          type: 'fill',
          source: `service-area-${idx}`,
          paint: {
            'fill-color': '#14b89a',
            'fill-opacity': 0.1,
          },
        });

        // Border layer
        map.addLayer({
          id: `service-area-border-${idx}`,
          type: 'line',
          source: `service-area-${idx}`,
          paint: {
            'line-color': '#14b89a',
            'line-width': 2,
            'line-opacity': 0.4,
          },
        });

        // Add home base marker
        const homeMarkerEl = document.createElement('div');
        homeMarkerEl.className = 'w-3 h-3 rounded-full';
        homeMarkerEl.style.background = '#14b89a';
        homeMarkerEl.style.border = '2px solid white';
        homeMarkerEl.style.boxShadow = '0 2px 4px rgba(0,0,0,0.2)';

        new mapboxgl.Marker({ element: homeMarkerEl })
          .setLngLat(base.coordinates)
          .setPopup(
            new mapboxgl.Popup({ offset: 15 }).setHTML(
              `<div style="padding: 4px; font-size: 12px; font-weight: 600;">${base.name}</div>`
            )
          )
          .addTo(map);
      });

      // Create initial marker for selected address (hidden initially)
      const markerEl = document.createElement('div');
      markerEl.className = 'w-8 h-8 rounded-full';
      markerEl.style.background = 'linear-gradient(135deg, #14b89a 0%, #22d3bd 100%)';
      markerEl.style.boxShadow = '0 4px 12px rgba(20, 184, 154, 0.4)';
      markerEl.style.border = '3px solid white';
      markerEl.style.cursor = 'pointer';

      const marker = new mapboxgl.Marker({ element: markerEl })
        .setLngLat(DEFAULT_MAP_CENTER);

      markerRef.current = marker;
      setMapLoaded(true);
    });

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Add marker to map when coordinates are selected
  useEffect(() => {
    if (selectedCoords && mapRef.current && markerRef.current && mapLoaded) {
      markerRef.current.addTo(mapRef.current);
    }
  }, [selectedCoords, mapLoaded]);

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Address Input with Autocomplete */}
      <div className="relative">
        <label className="text-sm font-medium mb-2 block" style={{ color: 'rgba(26, 26, 26, 0.7)' }}>
          Service Location
        </label>
        <input
          type="text"
          className="w-full rounded-2xl border-2 px-5 py-4 text-lg transition-all outline-none bg-zinc-50 focus:bg-white"
          style={{
            borderColor: inputValue && !error ? 'var(--color-primary-400)' : error ? '#ef4444' : 'rgba(20, 184, 154, 0.2)',
            boxShadow: inputValue && !error ? 'var(--shadow-glow)' : 'none',
          }}
          placeholder="Start typing an address..."
          value={inputValue}
          onChange={handleInputChange}
          onFocus={() => setShowDropdown(results.length > 0)}
          onBlur={() => {
            // Delay hiding dropdown to allow click on result
            setTimeout(() => setShowDropdown(false), 200);
          }}
        />

        {/* Autocomplete Dropdown */}
        {showDropdown && (
          <div
            className="absolute z-50 w-full mt-2 rounded-2xl border-2 overflow-hidden animate-slide-down"
            style={{
              background: 'white',
              borderColor: 'var(--color-primary-200)',
              boxShadow: 'var(--shadow-xl)',
            }}
          >
            {isSearching ? (
              <div className="px-5 py-4 text-sm" style={{ color: 'rgba(26, 26, 26, 0.5)' }}>
                Searching...
              </div>
            ) : results.length === 0 ? (
              <div className="px-5 py-4 text-sm" style={{ color: 'rgba(26, 26, 26, 0.5)' }}>
                No addresses found
              </div>
            ) : (
              results.map((result) => (
                <button
                  key={result.id}
                  className="w-full px-5 py-3 text-left text-sm hover:bg-emerald-50 transition-colors border-b last:border-b-0"
                  style={{ borderColor: 'rgba(20, 184, 154, 0.1)' }}
                  onClick={() => handleSelectResult(result)}
                >
                  {result.place_name}
                </button>
              ))
            )}
          </div>
        )}

        {/* Loading indicator */}
        {isSearching && !showDropdown && (
          <div className="absolute right-5 top-11 text-emerald-600">
            <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
          </div>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div
          className="px-4 py-3 rounded-xl text-sm border-2"
          style={{
            background: 'rgba(239, 68, 68, 0.05)',
            borderColor: 'rgba(239, 68, 68, 0.2)',
            color: '#dc2626',
          }}
        >
          ⚠️ {error}
        </div>
      )}

      {/* Distance Display */}
      {selectedCoords && (
        <div className="text-sm font-medium text-emerald-700 bg-gradient-to-br from-emerald-50 to-teal-50 px-5 py-3 rounded-xl border-2 border-emerald-200">
          📍 {distance} miles from nearest service location
        </div>
      )}

      {/* Map Container */}
      <div className="rounded-2xl overflow-hidden border-2" style={{ borderColor: 'rgba(20, 184, 154, 0.2)' }}>
        <div
          ref={mapContainerRef}
          className="w-full h-[300px] md:h-[400px]"
          style={{ background: '#f1f5f9' }}
        />
      </div>

      {/* Map Legend */}
      <div className="text-xs text-zinc-600 flex items-center gap-4 flex-wrap">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-emerald-500" />
          <span>Service locations</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-0.5 bg-emerald-500 opacity-40" style={{ width: '16px' }} />
          <span>50-mile service radius</span>
        </div>
      </div>
    </div>
  );
}
