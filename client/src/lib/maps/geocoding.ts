/**
 * Geocoding Helper
 * Converts addresses to lat/lng coordinates using Google Maps API
 *
 * Fallback to stub if API key not configured
 */

export interface GeocodeResult {
  lat: number;
  lng: number;
  formatted_address: string;
}

/**
 * Geocode an address to lat/lng
 * Uses Google Maps Geocoding API if key is available, otherwise returns mock data
 */
export async function geocodeAddress(address: string): Promise<GeocodeResult | null> {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  // If no API key, use mock data (for development/testing)
  if (!apiKey) {
    console.log('[GEOCODING - STUB MODE] No API key configured, using mock data for:', address);
    return getMockGeocodeResult(address);
  }

  try {
    const encodedAddress = encodeURIComponent(address);
    const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodedAddress}&key=${apiKey}`;

    const response = await fetch(url);
    const data = await response.json();

    if (data.status !== 'OK' || data.results.length === 0) {
      console.error('Geocoding failed:', data.status);
      return getMockGeocodeResult(address); // Fallback to mock
    }

    const result = data.results[0];
    return {
      lat: result.geometry.location.lat,
      lng: result.geometry.location.lng,
      formatted_address: result.formatted_address,
    };
  } catch (error) {
    console.error('Geocoding error:', error);
    return getMockGeocodeResult(address); // Fallback to mock on error
  }
}

/**
 * Reverse geocode lat/lng to address
 */
export async function reverseGeocode(lat: number, lng: number): Promise<string | null> {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  if (!apiKey) {
    console.log('[GEOCODING - STUB MODE] No API key configured');
    return `${lat.toFixed(4)}, ${lng.toFixed(4)} (Austin, TX area)`;
  }

  try {
    const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${apiKey}`;

    const response = await fetch(url);
    const data = await response.json();

    if (data.status !== 'OK' || data.results.length === 0) {
      console.error('Reverse geocoding failed:', data.status);
      return null;
    }

    return data.results[0].formatted_address;
  } catch (error) {
    console.error('Reverse geocoding error:', error);
    return null;
  }
}

/**
 * Mock geocode result for development/testing
 */
function getMockGeocodeResult(address: string): GeocodeResult {
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

  return mockCoordinates.downtown;
}
