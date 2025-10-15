/**
 * Event API Routes (by ID)
 * GET /api/events/[id] - Get event details
 * PUT /api/events/[id] - Update event
 */

import { createClient } from '@/lib/supabase/route-handler';
import { geocodeAddress } from '@/lib/maps/geocoding';
import { NextResponse } from 'next/server';
import { z } from 'zod';

// Validation schema for updates
const updateEventSchema = z.object({
  eventDate: z.string().refine(date => !isNaN(Date.parse(date)), 'Invalid date format').optional(),
  budget: z.number().positive().optional(),
  guestCount: z.number().int().positive().optional(),
  locationAddress: z.string().min(1).optional(),
  eventType: z.enum(['social', 'mixer', 'formal', 'fundraiser', 'conference', 'other']).optional(),
  description: z.string().optional(),
  status: z.enum(['draft', 'active', 'booked', 'closed']).optional(),
});

export async function GET(
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

    // Get event
    const { data: event, error } = await supabase
      .from('events')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { data: null, error: { message: 'Event not found', code: 'NOT_FOUND' } },
          { status: 404 }
        );
      }

      console.error('Error fetching event:', error);
      return NextResponse.json(
        { data: null, error: { message: error.message, code: 'DB_ERROR' } },
        { status: 500 }
      );
    }

    // Verify ownership (RLS should handle this, but double check)
    if (event.planner_id !== user.id) {
      return NextResponse.json(
        { data: null, error: { message: 'You can only view your own events', code: 'FORBIDDEN' } },
        { status: 403 }
      );
    }

    return NextResponse.json({ data: event, error: null }, { status: 200 });
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
    const { data: event, error: eventError } = await supabase
      .from('events')
      .select('planner_id')
      .eq('id', id)
      .single();

    if (eventError) {
      return NextResponse.json(
        { data: null, error: { message: 'Event not found', code: 'NOT_FOUND' } },
        { status: 404 }
      );
    }

    if (event.planner_id !== user.id) {
      return NextResponse.json(
        { data: null, error: { message: 'You can only update your own events', code: 'FORBIDDEN' } },
        { status: 403 }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const validatedData = updateEventSchema.parse(body);

    // Prepare update data
    const updateData: any = {};

    if (validatedData.eventDate) updateData.event_date = validatedData.eventDate;
    if (validatedData.budget !== undefined) updateData.budget = validatedData.budget;
    if (validatedData.guestCount) updateData.guest_count = validatedData.guestCount;
    if (validatedData.eventType) updateData.event_type = validatedData.eventType;
    if (validatedData.description !== undefined) updateData.description = validatedData.description;
    if (validatedData.status) updateData.status = validatedData.status;

    if (validatedData.locationAddress) {
      const geocodeResult = await geocodeAddress(validatedData.locationAddress);
      updateData.location_address = geocodeResult?.formatted_address || validatedData.locationAddress;
      updateData.location_lat = geocodeResult?.lat || null;
      updateData.location_lng = geocodeResult?.lng || null;
    }

    // Update event
    const { data: updatedEvent, error: updateError } = await supabase
      .from('events')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (updateError) {
      console.error('Error updating event:', updateError);
      return NextResponse.json(
        { data: null, error: { message: updateError.message, code: 'DB_ERROR' } },
        { status: 500 }
      );
    }

    return NextResponse.json({ data: updatedEvent, error: null }, { status: 200 });
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
