/**
 * Package API Routes
 * POST /api/packages - Create package
 * GET /api/packages - Search/filter packages
 * GET /api/packages?vendorId={id} - Get packages for specific vendor
 * GET /api/packages?eventId={id} - Get matched packages for event
 */

import { createClient } from '@/lib/supabase/route-handler';
import { matchPackages } from '@/lib/matching/algorithm';
import { generateEmbedding, generateSearchDescription } from '@/lib/ai/embeddings';
import { NextResponse } from 'next/server';
import { z } from 'zod';

// Validation schemas
const dayAvailabilitySchema = z.object({
  isOpen: z.boolean(),
  openTime: z.string(),
  closeTime: z.string(),
});

const exceptionDateSchema = z.object({
  date: z.string(), // YYYY-MM-DD format
  reason: z.string(),
});

const packageSchema = z.object({
  vendorId: z.string().uuid(),
  name: z.string().min(1, 'Package name is required'),
  description: z.string().min(20, 'Description must be at least 20 characters'),
  venueDetails: z.object({
    name: z.string(),
    min_capacity: z.number().int().positive(),
    max_capacity: z.number().int().positive(),
    square_footage: z.number().int().positive().optional(),
    short_description: z.string().optional(),
    amenities: z.array(z.string()),
    availability: z.object({
      monday: dayAvailabilitySchema,
      tuesday: dayAvailabilitySchema,
      wednesday: dayAvailabilitySchema,
      thursday: dayAvailabilitySchema,
      friday: dayAvailabilitySchema,
      saturday: dayAvailabilitySchema,
      sunday: dayAvailabilitySchema,
    }).optional(),
    exception_dates: z.array(exceptionDateSchema).optional(),
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
  hourlyRateMin: z.number().positive('Minimum hourly rate must be positive').optional(),
  hourlyRateMax: z.number().positive('Maximum hourly rate must be positive').optional(),
  capacity: z.number().int().positive('Capacity must be a positive integer'),
  photos: z.array(z.string()).default([]),
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

    // Validate hourly rate range if provided
    if (
      validatedData.hourlyRateMin &&
      validatedData.hourlyRateMax &&
      validatedData.hourlyRateMin > validatedData.hourlyRateMax
    ) {
      return NextResponse.json(
        { data: null, error: { message: 'Minimum hourly rate cannot exceed maximum hourly rate', code: 'VALIDATION_ERROR' } },
        { status: 400 }
      );
    }

    // Validate capacity range if venue details provided
    if (
      validatedData.venueDetails &&
      validatedData.venueDetails.min_capacity > validatedData.venueDetails.max_capacity
    ) {
      return NextResponse.json(
        { data: null, error: { message: 'Minimum capacity cannot exceed maximum capacity', code: 'VALIDATION_ERROR' } },
        { status: 400 }
      );
    }

    // Generate search description and embedding
    let embedding: number[] | null = null;
    let searchDescription: string | null = null;

    try {
      searchDescription = generateSearchDescription({
        name: validatedData.name,
        description: validatedData.description,
        venue_details: validatedData.venueDetails || {},
        catering_details: validatedData.cateringDetails || {},
        entertainment_details: validatedData.entertainmentDetails || {},
        price_min: validatedData.priceMin,
        price_max: validatedData.priceMax,
        capacity: validatedData.capacity,
      });

      embedding = await generateEmbedding(searchDescription);
      console.log('✅ Generated embedding for new package');
    } catch (embeddingError) {
      // Log error but don't fail package creation
      console.error('Warning: Failed to generate embedding:', embeddingError);
      // Package will be created without embedding (can be backfilled later)
    }

    // Create package with embedding
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
        hourly_rate_min: validatedData.hourlyRateMin || null,
        hourly_rate_max: validatedData.hourlyRateMax || null,
        capacity: validatedData.capacity,
        photos: validatedData.photos || [],
        status: validatedData.status,
        embedding: embedding,
        search_description: searchDescription,
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
    // Optional: include all packages regardless of status (for development/testing)
    const includeAll = searchParams.get('includeAll') === 'true';

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

      // Get all published packages with vendor info (or all packages if includeAll=true)
      let matchQuery = supabase
        .from('packages')
        .select(`
          *,
          vendors(*)
        `);

      // Only apply status filters if not including all packages
      if (!includeAll) {
        matchQuery = matchQuery
          .eq('status', 'published')
          .eq('vendors.status', 'verified');
      }

      const { data: packages, error: pkgError } = await matchQuery;

      if (pkgError) {
        console.error('Error fetching packages:', pkgError);
        return NextResponse.json(
          { data: null, error: { message: pkgError.message, code: 'DB_ERROR' } },
          { status: 500 }
        );
      }

      // Filter out packages without vendor data and transform for matching algorithm
      const transformedPackages = (packages || [])
        .filter((pkg: any) => pkg.vendors) // Only include packages with vendor data
        .map((pkg: any) => ({
          ...pkg,
          vendor: pkg.vendors,
        }));

      // Apply matching algorithm
      const matchedPackages = matchPackages(transformedPackages, event);

      return NextResponse.json({ data: matchedPackages, error: null }, { status: 200 });
    }

    // Otherwise, return all published packages (or all packages if includeAll=true)
    let query = supabase
      .from('packages')
      .select(`
        *,
        vendors(*)
      `)
      .order('created_at', { ascending: false });

    // Only apply status filters if not including all packages
    if (!includeAll) {
      query = query
        .eq('status', 'published')
        .eq('vendors.status', 'verified');
    }

    const { data: packages, error: pkgError } = await query;

    if (pkgError) {
      console.error('Error fetching packages:', pkgError);
      return NextResponse.json(
        { data: null, error: { message: pkgError.message, code: 'DB_ERROR' } },
        { status: 500 }
      );
    }

    // Filter out packages without vendor data and transform
    const transformedPackages = (packages || [])
      .filter((pkg: any) => pkg.vendors) // Only include packages with vendor data
      .map((pkg: any) => ({
        ...pkg,
        vendor: pkg.vendors,
        distance: null, // No event context, so no distance calculation
        score: 0, // Default score
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
