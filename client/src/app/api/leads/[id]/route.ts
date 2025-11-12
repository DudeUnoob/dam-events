/**
 * Lead API Routes (by ID)
 * GET /api/leads/[id] - Get lead details
 * PUT /api/leads/[id] - Update lead status
 */

import { createClient } from '@/lib/supabase/route-handler';
import { NextResponse } from 'next/server';
import { z } from 'zod';

// Validation schema for updates
const updateLeadSchema = z.object({
  status: z.enum(['new', 'viewed', 'quoted', 'booked', 'declined', 'closed']),
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

    // Get lead with full details
    const { data: lead, error } = await supabase
      .from('leads')
      .select(`
        *,
        events(*),
        packages(*),
        vendors(business_name, location_address, services, user_id),
        users!leads_planner_id_fkey(full_name, email, organization)
      `)
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { data: null, error: { message: 'Lead not found', code: 'NOT_FOUND' } },
          { status: 404 }
        );
      }

      console.error('Error fetching lead:', error);
      return NextResponse.json(
        { data: null, error: { message: error.message, code: 'DB_ERROR' } },
        { status: 500 }
      );
    }

    // Verify access (planner or vendor involved in this lead)
    const { data: vendor } = await supabase
      .from('vendors')
      .select('id')
      .eq('user_id', user.id)
      .maybeSingle();

    const isPlanner = lead.planner_id === user.id;
    const isVendor = vendor && lead.vendor_id === vendor.id;

    if (!isPlanner && !isVendor) {
      return NextResponse.json(
        { data: null, error: { message: 'You do not have access to this lead', code: 'FORBIDDEN' } },
        { status: 403 }
      );
    }

    return NextResponse.json({ data: lead, error: null }, { status: 200 });
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

    // Parse and validate request body
    const body = await request.json();
    const validatedData = updateLeadSchema.parse(body);

    // Get lead and verify access
    const { data: lead, error: leadError } = await supabase
      .from('leads')
      .select('*, vendors!inner(user_id)')
      .eq('id', id)
      .single();

    if (leadError) {
      return NextResponse.json(
        { data: null, error: { message: 'Lead not found', code: 'NOT_FOUND' } },
        { status: 404 }
      );
    }

    const isPlanner = lead.planner_id === user.id;
    const isVendor = lead.vendors.user_id === user.id;

    if (!isPlanner && !isVendor) {
      return NextResponse.json(
        { data: null, error: { message: 'You do not have access to update this lead', code: 'FORBIDDEN' } },
        { status: 403 }
      );
    }

    // Validate status transition based on role
    if (isPlanner && !['booked', 'closed'].includes(validatedData.status)) {
      return NextResponse.json(
        { data: null, error: { message: 'Planners can only set status to booked or closed', code: 'VALIDATION_ERROR' } },
        { status: 400 }
      );
    }

    if (isVendor && ['booked', 'closed'].includes(validatedData.status)) {
      return NextResponse.json(
        { data: null, error: { message: 'Vendors cannot set status to booked or closed', code: 'VALIDATION_ERROR' } },
        { status: 400 }
      );
    }

    // Update lead
    const { data: updatedLead, error: updateError } = await supabase
      .from('leads')
      .update({ status: validatedData.status })
      .eq('id', id)
      .select()
      .single();

    if (updateError) {
      console.error('Error updating lead:', updateError);
      return NextResponse.json(
        { data: null, error: { message: updateError.message, code: 'DB_ERROR' } },
        { status: 500 }
      );
    }

    return NextResponse.json({ data: updatedLead, error: null }, { status: 200 });
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
