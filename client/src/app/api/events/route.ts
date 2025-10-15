/**
 * Event API Routes
 * POST /api/events - Create event
 * GET /api/events - Get user's events
 */

import { createClient } from '@/lib/supabase/route-handler';
import { geocodeAddress } from '@/lib/maps/geocoding';
import { NextResponse } from 'next/server';
import { z } from 'zod';

// Validation schema
const eventSchema = z.object({
  eventDate: z.string().refine(date => !isNaN(Date.parse(date)), 'Invalid date format'),
  budget: z.number().positive('Budget must be positive'),
  guestCount: z.number().int().positive('Guest count must be a positive integer'),
  locationAddress: z.string().min(1, 'Location address is required'),
  eventType: z.enum(['social', 'mixer', 'formal', 'fundraiser', 'conference', 'other']),
  description: z.string().optional(),
  status: z.enum(['draft', 'active']).default('active'),
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

    // Verify user is a planner
    const { data: userProfile } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single();

    if (userProfile?.role !== 'planner') {
      return NextResponse.json(
        { data: null, error: { message: 'Only planners can create events', code: 'FORBIDDEN' } },
        { status: 403 }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const validatedData = eventSchema.parse(body);

    // Geocode the address
    const geocodeResult = await geocodeAddress(validatedData.locationAddress);

    // Create event
    const { data: event, error: eventError } = await supabase
      .from('events')
      .insert({
        planner_id: user.id,
        event_date: validatedData.eventDate,
        budget: validatedData.budget,
        guest_count: validatedData.guestCount,
        location_address: geocodeResult?.formatted_address || validatedData.locationAddress,
        location_lat: geocodeResult?.lat || null,
        location_lng: geocodeResult?.lng || null,
        event_type: validatedData.eventType,
        description: validatedData.description || null,
        status: validatedData.status,
      })
      .select()
      .single();

    if (eventError) {
      console.error('Error creating event:', eventError);
      return NextResponse.json(
        { data: null, error: { message: eventError.message, code: 'DB_ERROR' } },
        { status: 500 }
      );
    }

    return NextResponse.json({ data: event, error: null }, { status: 201 });
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

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { data: null, error: { message: 'Unauthorized', code: 'AUTH_ERROR' } },
        { status: 401 }
      );
    }

    // Get user's events
    const { data: events, error: eventsError } = await supabase
      .from('events')
      .select('*')
      .eq('planner_id', user.id)
      .order('event_date', { ascending: true });

    if (eventsError) {
      console.error('Error fetching events:', eventsError);
      return NextResponse.json(
        { data: null, error: { message: eventsError.message, code: 'DB_ERROR' } },
        { status: 500 }
      );
    }

    return NextResponse.json({ data: events, error: null }, { status: 200 });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { data: null, error: { message: 'Internal server error', code: 'INTERNAL_ERROR' } },
      { status: 500 }
    );
  }
}
