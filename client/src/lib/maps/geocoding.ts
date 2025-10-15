/**
 * Geocoding Helper
 * Converts addresses to lat/lng coordinates
 *
 * STUBBED VERSION - Returns mock coordinates
 * To implement Google Maps API:
 * 1. Add NEXT_PUBLIC_GOOGLE_MAPS_API_KEY to .env.local
 * 2. Uncomment the real implementation below
 * 3. npm install @googlemaps/google-maps-services-js
 */

export interface GeocodeResult {
  lat: number;
  lng: number;
  formatted_address: string;
}

/**
 * Geocode an address to lat/lng
 * Currently returns mock data for Austin, TX area
 */
export async function geocodeAddress(address: string): Promise<GeocodeResult | null> {
  console.log('[GEOCODING - STUBBED] Geocoding address:', address);

  // Stubbed implementation - returns mock coordinates near Austin, TX
  // In production, this would call Google Maps Geocoding API

  // Mock different areas in Austin for testing
  const mockCoordinates: Record<string, GeocodeResult> = {
    'downtown': {
      lat: 30.2672,
      lng: -97.7431,
      formatted_address: '123 Congress Ave, Austin, TX 78701'
    },
    'university': {
      lat: 30.2849,
      lng: -97.7341,
      formatted_address: 'University of Texas, Austin, TX 78712'
    },
    'south': {
      lat: 30.2241,
      lng: -97.7470,
      formatted_address: '456 South Congress Ave, Austin, TX 78704'
    },
    'north': {
      lat: 30.3572,
      lng: -97.7223,
      formatted_address: '789 North Lamar, Austin, TX 78753'
    }
  };

  // Simple keyword matching for stub
  const addressLower = address.toLowerCase();
  if (addressLower.includes('downtown') || addressLower.includes('congress')) {
    return mockCoordinates.downtown;
  } else if (addressLower.includes('university') || addressLower.includes('ut') || addressLower.includes('campus')) {
    return mockCoordinates.university;
  } else if (addressLower.includes('south')) {
    return mockCoordinates.south;
  } else if (addressLower.includes('north')) {
    return mockCoordinates.north;
  }

  // Default to downtown Austin
  return mockCoordinates.downtown;
}

/**
 * Reverse geocode lat/lng to address
 */
export async function reverseGeocode(lat: number, lng: number): Promise<string | null> {
  console.log('[GEOCODING - STUBBED] Reverse geocoding:', { lat, lng });

  // Stubbed implementation
  return `${lat.toFixed(4)}, ${lng.toFixed(4)} (Austin, TX area)`;
}

/*
// REAL IMPLEMENTATION (uncomment when ready to use Google Maps API)
// npm install @googlemaps/google-maps-services-js

import { Client } from '@googlemaps/google-maps-services-js';

const client = new Client({});

export async function geocodeAddress(address: string): Promise<GeocodeResult | null> {
  try {
    const response = await client.geocode({
      params: {
        address,
        key: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!,
      },
    });

    if (response.data.results.length === 0) {
      return null;
    }

    const result = response.data.results[0];
    return {
      lat: result.geometry.location.lat,
      lng: result.geometry.location.lng,
      formatted_address: result.formatted_address,
    };
  } catch (error) {
    console.error('Geocoding error:', error);
    return null;
  }
}

export async function reverseGeocode(lat: number, lng: number): Promise<string | null> {
  try {
    const response = await client.reverseGeocode({
      params: {
        latlng: { lat, lng },
        key: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!,
      },
    });

    if (response.data.results.length === 0) {
      return null;
    }

    return response.data.results[0].formatted_address;
  } catch (error) {
    console.error('Reverse geocoding error:', error);
    return null;
  }
}
*/
