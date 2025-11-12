/**
 * Lead API Routes
 * POST /api/leads - Create lead (request quote) + send notifications
 * GET /api/leads - Get leads for current user (planner or vendor)
 */

import { createClient } from '@/lib/supabase/route-handler';
import { sendLeadNotification } from '@/lib/notifications';
import { NextResponse } from 'next/server';
import { z } from 'zod';

// Validation schema
const leadSchema = z.object({
  eventId: z.string().uuid(),
  packageId: z.string().uuid(),
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
    const validatedData = leadSchema.parse(body);

    // Get event details and verify ownership
    const { data: event, error: eventError } = await supabase
      .from('events')
      .select('*')
      .eq('id', validatedData.eventId)
      .eq('planner_id', user.id)
      .single();

    if (eventError || !event) {
      return NextResponse.json(
        { data: null, error: { message: 'Event not found or unauthorized', code: 'NOT_FOUND' } },
        { status: 404 }
      );
    }

    // Get package and vendor details
    const { data: pkg, error: pkgError } = await supabase
      .from('packages')
      .select(`
        *,
        vendors!inner(
          *,
          users!inner(*)
        )
      `)
      .eq('id', validatedData.packageId)
      .single();

    if (pkgError || !pkg) {
      return NextResponse.json(
        { data: null, error: { message: 'Package not found', code: 'NOT_FOUND' } },
        { status: 404 }
      );
    }

    // Check if lead already exists
    const { data: existingLead } = await supabase
      .from('leads')
      .select('id')
      .eq('event_id', validatedData.eventId)
      .eq('package_id', validatedData.packageId)
      .maybeSingle();

    if (existingLead) {
      return NextResponse.json(
        { data: null, error: { message: 'You have already requested a quote for this package', code: 'ALREADY_EXISTS' } },
        { status: 400 }
      );
    }

    // Get planner details
    const { data: planner } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single();

    // Create lead
    const { data: lead, error: leadError } = await supabase
      .from('leads')
      .insert({
        event_id: validatedData.eventId,
        package_id: validatedData.packageId,
        vendor_id: pkg.vendor_id,
        planner_id: user.id,
        status: 'new',
      })
      .select()
      .single();

    if (leadError) {
      console.error('Error creating lead:', leadError);
      return NextResponse.json(
        { data: null, error: { message: leadError.message, code: 'DB_ERROR' } },
        { status: 500 }
      );
    }

    // Send notifications to vendor (stubbed for now)
    const leadUrl = `${process.env.NEXT_PUBLIC_APP_URL}/vendor/leads/${lead.id}`;

    await sendLeadNotification({
      vendorName: pkg.vendors.business_name,
      vendorEmail: pkg.vendors.users.email,
      vendorPhone: pkg.vendors.users.phone || '',
      eventDate: event.event_date,
      guestCount: event.guest_count,
      budget: event.budget,
      leadUrl,
      plannerOrganization: planner?.organization || 'Unknown Organization',
    });

    return NextResponse.json({ data: lead, error: null }, { status: 201 });
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
    const role = searchParams.get('role'); // 'planner' or 'vendor'

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { data: null, error: { message: 'Unauthorized', code: 'AUTH_ERROR' } },
        { status: 401 }
      );
    }

    let leads;

    if (role === 'vendor') {
      // Get vendor's leads
      const { data: vendor } = await supabase
        .from('vendors')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();

      if (!vendor) {
        return NextResponse.json({ data: [], error: null }, { status: 200 });
      }

      const { data, error } = await supabase
        .from('leads')
        .select(`
          *,
          events(*),
          packages(*),
          users!leads_planner_id_fkey(full_name, email, organization)
        `)
        .eq('vendor_id', vendor.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching vendor leads:', error);
        return NextResponse.json(
          { data: null, error: { message: error.message, code: 'DB_ERROR' } },
          { status: 500 }
        );
      }

      leads = data;
    } else {
      // Get planner's leads
      const { data, error } = await supabase
        .from('leads')
        .select(`
          *,
          events(*),
          packages(*),
          vendors(business_name, location_address, user_id)
        `)
        .eq('planner_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching planner leads:', error);
        return NextResponse.json(
          { data: null, error: { message: error.message, code: 'DB_ERROR' } },
          { status: 500 }
        );
      }

      leads = data;
    }

    return NextResponse.json({ data: leads, error: null }, { status: 200 });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { data: null, error: { message: 'Internal server error', code: 'INTERNAL_ERROR' } },
      { status: 500 }
    );
  }
}
