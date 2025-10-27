/**
 * Package API Routes (by ID)
 * GET /api/packages/[id] - Get package details
 * PUT /api/packages/[id] - Update package
 * DELETE /api/packages/[id] - Delete package
 */

import { createClient } from '@/lib/supabase/route-handler';
import { NextResponse } from 'next/server';
import { z } from 'zod';

// Validation schema for updates
const updatePackageSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().min(20).optional(),
  venueDetails: z.object({
    name: z.string(),
    capacity: z.number().positive(),
    amenities: z.array(z.string()),
  }).optional(),
  cateringDetails: z.object({
    menuOptions: z.array(z.string()),
    dietaryAccommodations: z.array(z.string()),
  }).optional(),
  entertainmentDetails: z.object({
    type: z.string(),
    equipment: z.array(z.string()),
  }).optional(),
  priceMin: z.number().positive().optional(),
  priceMax: z.number().positive().optional(),
  capacity: z.number().int().positive().optional(),
  status: z.enum(['draft', 'published']).optional(),
});

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createClient();
    const { id } = params;

    // Get package with vendor info
    const { data: pkg, error } = await supabase
      .from('packages')
      .select(`
        *,
        vendors(*)
      `)
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { data: null, error: { message: 'Package not found', code: 'NOT_FOUND' } },
          { status: 404 }
        );
      }

      console.error('Error fetching package:', error);
      return NextResponse.json(
        { data: null, error: { message: error.message, code: 'DB_ERROR' } },
        { status: 500 }
      );
    }

    // Transform to include vendor
    const transformedPackage = {
      ...pkg,
      vendor: pkg.vendors,
    };

    return NextResponse.json({ data: transformedPackage, error: null }, { status: 200 });
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

    // Get package and verify ownership
    const { data: pkg, error: pkgError } = await supabase
      .from('packages')
      .select(`
        *,
        vendors!inner(user_id, status)
      `)
      .eq('id', id)
      .single();

    if (pkgError) {
      return NextResponse.json(
        { data: null, error: { message: 'Package not found', code: 'NOT_FOUND' } },
        { status: 404 }
      );
    }

    if (pkg.vendors.user_id !== user.id) {
      return NextResponse.json(
        { data: null, error: { message: 'You can only update your own packages', code: 'FORBIDDEN' } },
        { status: 403 }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const validatedData = updatePackageSchema.parse(body);

    // Prevent unverified vendors from publishing
    if (validatedData.status === 'published' && pkg.vendors.status !== 'verified') {
      return NextResponse.json(
        {
          data: null,
          error: {
            message: 'Only verified vendors can publish packages. Please wait for admin approval.',
            code: 'VENDOR_NOT_VERIFIED'
          }
        },
        { status: 403 }
      );
    }

    // Prepare update data
    const updateData: any = {};

    if (validatedData.name) updateData.name = validatedData.name;
    if (validatedData.description) updateData.description = validatedData.description;
    if (validatedData.venueDetails) updateData.venue_details = validatedData.venueDetails;
    if (validatedData.cateringDetails) updateData.catering_details = validatedData.cateringDetails;
    if (validatedData.entertainmentDetails) updateData.entertainment_details = validatedData.entertainmentDetails;
    if (validatedData.priceMin !== undefined) updateData.price_min = validatedData.priceMin;
    if (validatedData.priceMax !== undefined) updateData.price_max = validatedData.priceMax;
    if (validatedData.capacity) updateData.capacity = validatedData.capacity;
    if (validatedData.status) updateData.status = validatedData.status;

    // Validate price range if both are provided
    const newPriceMin = validatedData.priceMin ?? pkg.price_min;
    const newPriceMax = validatedData.priceMax ?? pkg.price_max;

    if (newPriceMin > newPriceMax) {
      return NextResponse.json(
        { data: null, error: { message: 'Minimum price cannot exceed maximum price', code: 'VALIDATION_ERROR' } },
        { status: 400 }
      );
    }

    // Update package
    const { data: updatedPkg, error: updateError } = await supabase
      .from('packages')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (updateError) {
      console.error('Error updating package:', updateError);
      return NextResponse.json(
        { data: null, error: { message: updateError.message, code: 'DB_ERROR' } },
        { status: 500 }
      );
    }

    return NextResponse.json({ data: updatedPkg, error: null }, { status: 200 });
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

export async function DELETE(
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

    // Get package and verify ownership
    const { data: pkg, error: pkgError } = await supabase
      .from('packages')
      .select(`
        *,
        vendors!inner(user_id)
      `)
      .eq('id', id)
      .single();

    if (pkgError) {
      return NextResponse.json(
        { data: null, error: { message: 'Package not found', code: 'NOT_FOUND' } },
        { status: 404 }
      );
    }

    if (pkg.vendors.user_id !== user.id) {
      return NextResponse.json(
        { data: null, error: { message: 'You can only delete your own packages', code: 'FORBIDDEN' } },
        { status: 403 }
      );
    }

    // Delete package
    const { error: deleteError } = await supabase
      .from('packages')
      .delete()
      .eq('id', id);

    if (deleteError) {
      console.error('Error deleting package:', deleteError);
      return NextResponse.json(
        { data: null, error: { message: deleteError.message, code: 'DB_ERROR' } },
        { status: 500 }
      );
    }

    return NextResponse.json({ data: { id }, error: null }, { status: 200 });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { data: null, error: { message: 'Internal server error', code: 'INTERNAL_ERROR' } },
      { status: 500 }
    );
  }
}
