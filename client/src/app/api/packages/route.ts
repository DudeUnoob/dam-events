/**
 * Package API Routes
 * POST /api/packages - Create package
 * GET /api/packages - Search/filter packages
 * GET /api/packages?vendorId={id} - Get packages for specific vendor
 * GET /api/packages?eventId={id} - Get matched packages for event
 */

import { createClient } from '@/lib/supabase/route-handler';
import { matchPackages } from '@/lib/matching/algorithm';
import { NextResponse } from 'next/server';
import { z } from 'zod';

// Validation schema
const packageSchema = z.object({
  vendorId: z.string().uuid(),
  name: z.string().min(1, 'Package name is required'),
  description: z.string().min(20, 'Description must be at least 20 characters'),
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
  priceMin: z.number().positive('Minimum price must be positive'),
  priceMax: z.number().positive('Maximum price must be positive'),
  capacity: z.number().int().positive('Capacity must be a positive integer'),
  status: z.enum(['draft', 'published']).default('draft'),
});

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

    // Parse and validate request body
    const body = await request.json();
    const validatedData = packageSchema.parse(body);

    // Verify vendor ownership
    const { data: vendor, error: vendorError } = await supabase
      .from('vendors')
      .select('id')
      .eq('id', validatedData.vendorId)
      .eq('user_id', user.id)
      .single();

    if (vendorError || !vendor) {
      return NextResponse.json(
        { data: null, error: { message: 'Vendor not found or unauthorized', code: 'FORBIDDEN' } },
        { status: 403 }
      );
    }

    // Validate price range
    if (validatedData.priceMin > validatedData.priceMax) {
      return NextResponse.json(
        { data: null, error: { message: 'Minimum price cannot exceed maximum price', code: 'VALIDATION_ERROR' } },
        { status: 400 }
      );
    }

    // Create package
    const { data: pkg, error: pkgError } = await supabase
      .from('packages')
      .insert({
        vendor_id: validatedData.vendorId,
        name: validatedData.name,
        description: validatedData.description,
        venue_details: validatedData.venueDetails || null,
        catering_details: validatedData.cateringDetails || null,
        entertainment_details: validatedData.entertainmentDetails || null,
        price_min: validatedData.priceMin,
        price_max: validatedData.priceMax,
        capacity: validatedData.capacity,
        photos: [],
        status: validatedData.status,
      })
      .select()
      .single();

    if (pkgError) {
      console.error('Error creating package:', pkgError);
      return NextResponse.json(
        { data: null, error: { message: pkgError.message, code: 'DB_ERROR' } },
        { status: 500 }
      );
    }

    return NextResponse.json({ data: pkg, error: null }, { status: 201 });
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

export async function GET(request: Request) {
  try {
    const supabase = createClient();
    const { searchParams } = new URL(request.url);

    // Optional: event ID for matching
    const eventId = searchParams.get('eventId');
    // Optional: vendor ID for filtering vendor's own packages
    const vendorId = searchParams.get('vendorId');

    // If vendorId is provided, return packages for that vendor (including drafts)
    if (vendorId) {
      const { data: packages, error: pkgError } = await supabase
        .from('packages')
        .select('*')
        .eq('vendor_id', vendorId)
        .order('created_at', { ascending: false });

      if (pkgError) {
        console.error('Error fetching vendor packages:', pkgError);
        return NextResponse.json(
          { data: null, error: { message: pkgError.message, code: 'DB_ERROR' } },
          { status: 500 }
        );
      }

      return NextResponse.json({ data: packages, error: null }, { status: 200 });
    }

    // If eventId is provided, use matching algorithm
    if (eventId) {
      // Get event details
      const { data: event, error: eventError } = await supabase
        .from('events')
        .select('*')
        .eq('id', eventId)
        .single();

      if (eventError || !event) {
        return NextResponse.json(
          { data: null, error: { message: 'Event not found', code: 'NOT_FOUND' } },
          { status: 404 }
        );
      }

      // Get all published packages with vendor info
      const { data: packages, error: pkgError } = await supabase
        .from('packages')
        .select(`
          *,
          vendors!inner(*)
        `)
        .eq('status', 'published')
        .eq('vendors.status', 'verified');

      if (pkgError) {
        console.error('Error fetching packages:', pkgError);
        return NextResponse.json(
          { data: null, error: { message: pkgError.message, code: 'DB_ERROR' } },
          { status: 500 }
        );
      }

      // Transform packages for matching algorithm
      const transformedPackages = packages.map((pkg: any) => ({
        ...pkg,
        vendor: pkg.vendors,
      }));

      // Apply matching algorithm
      const matchedPackages = matchPackages(transformedPackages, event);

      return NextResponse.json({ data: matchedPackages, error: null }, { status: 200 });
    }

    // Otherwise, return all published packages
    const { data: packages, error: pkgError } = await supabase
      .from('packages')
      .select(`
        *,
        vendors!inner(*)
      `)
      .eq('status', 'published')
      .eq('vendors.status', 'verified')
      .order('created_at', { ascending: false });

    if (pkgError) {
      console.error('Error fetching packages:', pkgError);
      return NextResponse.json(
        { data: null, error: { message: pkgError.message, code: 'DB_ERROR' } },
        { status: 500 }
      );
    }

    // Transform packages
    const transformedPackages = packages.map((pkg: any) => ({
      ...pkg,
      vendor: pkg.vendors,
    }));

    return NextResponse.json({ data: transformedPackages, error: null }, { status: 200 });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { data: null, error: { message: 'Internal server error', code: 'INTERNAL_ERROR' } },
      { status: 500 }
    );
  }
}
