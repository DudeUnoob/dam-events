/**
 * Vendor API Routes (by ID)
 * GET /api/vendors/[id] - Get vendor profile
 * PUT /api/vendors/[id] - Update vendor profile
 */

import { createClient } from '@/lib/supabase/route-handler';
import { geocodeAddress } from '@/lib/maps/geocoding';
import { NextResponse } from 'next/server';
import { z } from 'zod';

// Validation schema for updates
const updateVendorSchema = z.object({
  businessName: z.string().min(1).optional(),
  description: z.string().min(10).optional(),
  services: z.array(z.enum(['venue', 'catering', 'entertainment'])).min(1).optional(),
  locationAddress: z.string().min(1).optional(),
});

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createClient();
    const { id } = params;

    // Get vendor profile
    const { data: vendor, error } = await supabase
      .from('vendors')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { data: null, error: { message: 'Vendor not found', code: 'NOT_FOUND' } },
          { status: 404 }
        );
      }

      console.error('Error fetching vendor:', error);
      return NextResponse.json(
        { data: null, error: { message: error.message, code: 'DB_ERROR' } },
        { status: 500 }
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

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createClient();
    const { id } = params;

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { data: null, error: { message: 'Unauthorized', code: 'AUTH_ERROR' } },
        { status: 401 }
      );
    }

    // Verify ownership
    const { data: vendor, error: vendorError } = await supabase
      .from('vendors')
      .select('user_id')
      .eq('id', id)
      .single();

    if (vendorError) {
      return NextResponse.json(
        { data: null, error: { message: 'Vendor not found', code: 'NOT_FOUND' } },
        { status: 404 }
      );
    }

    if (vendor.user_id !== user.id) {
      return NextResponse.json(
        { data: null, error: { message: 'You can only update your own vendor profile', code: 'FORBIDDEN' } },
        { status: 403 }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const validatedData = updateVendorSchema.parse(body);

    // Prepare update data
    const updateData: any = {};

    if (validatedData.businessName) {
      updateData.business_name = validatedData.businessName;
    }
    if (validatedData.description) {
      updateData.description = validatedData.description;
    }
    if (validatedData.services) {
      updateData.services = validatedData.services;
    }
    if (validatedData.locationAddress) {
      const geocodeResult = await geocodeAddress(validatedData.locationAddress);
      updateData.location_address = geocodeResult?.formatted_address || validatedData.locationAddress;
      updateData.location_lat = geocodeResult?.lat || null;
      updateData.location_lng = geocodeResult?.lng || null;
    }

    // Update vendor profile
    const { data: updatedVendor, error: updateError } = await supabase
      .from('vendors')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (updateError) {
      console.error('Error updating vendor:', updateError);
      return NextResponse.json(
        { data: null, error: { message: updateError.message, code: 'DB_ERROR' } },
        { status: 500 }
      );
    }

    return NextResponse.json({ data: updatedVendor, error: null }, { status: 200 });
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
