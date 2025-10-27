/**
 * Vendor API Routes
 * GET /api/vendors - Get current user's vendor profile
 * POST /api/vendors - Create vendor profile
 */

import { createClient } from '@/lib/supabase/route-handler';
import { geocodeAddress } from '@/lib/maps/geocoding';
import { NextResponse } from 'next/server';
import { z } from 'zod';

// Validation schema
const vendorSchema = z.object({
  businessName: z.string().min(1, 'Business name is required'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  services: z.array(z.enum(['venue', 'catering', 'entertainment'])).min(1, 'At least one service is required'),
  locationAddress: z.string().min(1, 'Location address is required'),
});

export async function GET(request: Request) {
  try {
    const supabase = createClient();

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { data: null, error: { message: 'Unauthorized', code: 'AUTH_ERROR' } },
        { status: 401 }
      );
    }

    // Get vendor profile for current user
    const { data: vendor, error: vendorError } = await supabase
      .from('vendors')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();

    if (vendorError) {
      console.error('Error fetching vendor:', vendorError);
      return NextResponse.json(
        { data: null, error: { message: vendorError.message, code: 'DB_ERROR' } },
        { status: 500 }
      );
    }

    if (!vendor) {
      return NextResponse.json(
        { data: null, error: { message: 'Vendor profile not found', code: 'NOT_FOUND' } },
        { status: 404 }
      );
    }

    return NextResponse.json({ data: vendor, error: null }, { status: 200 });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { data: null, error: { message: 'Internal server error', code: 'INTERNAL_ERROR' } },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const supabase = createClient();

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { data: null, error: { message: 'Unauthorized', code: 'AUTH_ERROR' } },
        { status: 401 }
      );
    }

    // Verify user is a vendor
    const { data: userProfile } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single();

    if (userProfile?.role !== 'vendor') {
      return NextResponse.json(
        { data: null, error: { message: 'Only vendors can create vendor profiles', code: 'FORBIDDEN' } },
        { status: 403 }
      );
    }

    // Check if vendor profile already exists
    const { data: existingVendor } = await supabase
      .from('vendors')
      .select('id')
      .eq('user_id', user.id)
      .maybeSingle();

    if (existingVendor) {
      return NextResponse.json(
        { data: null, error: { message: 'Vendor profile already exists', code: 'ALREADY_EXISTS' } },
        { status: 400 }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const validatedData = vendorSchema.parse(body);

    // Geocode the address
    const geocodeResult = await geocodeAddress(validatedData.locationAddress);

    // Create vendor profile
    const { data: vendor, error: vendorError } = await supabase
      .from('vendors')
      .insert({
        user_id: user.id,
        business_name: validatedData.businessName,
        description: validatedData.description,
        services: validatedData.services,
        location_address: geocodeResult?.formatted_address || validatedData.locationAddress,
        location_lat: geocodeResult?.lat || null,
        location_lng: geocodeResult?.lng || null,
        status: 'pending', // Requires admin verification
      })
      .select()
      .single();

    if (vendorError) {
      console.error('Error creating vendor:', vendorError);
      return NextResponse.json(
        { data: null, error: { message: vendorError.message, code: 'DB_ERROR' } },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { data: vendor, error: null },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          data: null,
          error: {
            message: 'Invalid input',
            code: 'VALIDATION_ERROR',
            details: error.errors,
          },
        },
        { status: 400 }
      );
    }

    console.error('Unexpected error:', error);
    return NextResponse.json(
      { data: null, error: { message: 'Internal server error', code: 'INTERNAL_ERROR' } },
      { status: 500 }
    );
  }
}
