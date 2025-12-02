/**
 * Quotes API Routes
 * POST /api/quotes - Create a quote request (creates event + lead in one operation)
 *
 * This simplified endpoint allows planners to request quotes without
 * first creating an event separately.
 */

import { createClient } from '@/lib/supabase/route-handler';
import { sendLeadNotification } from '@/lib/notifications';
import { NextResponse } from 'next/server';
import { z } from 'zod';

// Validation schema for quote items
const quoteItemSchema = z.object({
  id: z.string(),
  name: z.string(),
  quantity: z.number().int().positive(),
  price: z.number().positive(),
  special_instructions: z.string().optional(),
});

// Validation schema for quote request
const quoteSchema = z.object({
  package_id: z.string().uuid(),
  vendor_id: z.string().uuid(),
  message: z.string().optional(),
  event_date: z.string().optional(),
  guest_count: z.number().int().positive().optional(),
  event_location: z.string().optional(),
  items: z.array(quoteItemSchema).optional(),
  subtotal: z.number().optional(),
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
    const validatedData = quoteSchema.parse(body);

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
      .eq('id', validatedData.package_id)
      .single();

    if (pkgError || !pkg) {
      return NextResponse.json(
        { data: null, error: { message: 'Package not found', code: 'NOT_FOUND' } },
        { status: 404 }
      );
    }

    // Get planner details
    const { data: planner } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single();

    // Create an event for this quote request
    const eventDate = validatedData.event_date || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]; // Default to 30 days from now
    const guestCount = validatedData.guest_count || 50;
    const budget = validatedData.subtotal || pkg.price_min * guestCount;

    const { data: event, error: eventError } = await supabase
      .from('events')
      .insert({
        planner_id: user.id,
        event_date: eventDate,
        guest_count: guestCount,
        budget: budget,
        location_address: validatedData.event_location || '',
        location_lat: 0,
        location_lng: 0,
        event_type: 'Quote Request',
        description: validatedData.message || `Quote request for ${pkg.name}`,
        status: 'active',
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

    // Check if lead already exists for this package
    const { data: existingLead } = await supabase
      .from('leads')
      .select('id')
      .eq('event_id', event.id)
      .eq('package_id', validatedData.package_id)
      .maybeSingle();

    if (existingLead) {
      return NextResponse.json(
        { data: null, error: { message: 'You have already requested a quote for this package', code: 'ALREADY_EXISTS' } },
        { status: 400 }
      );
    }

    // Create lead with quote details
    const { data: lead, error: leadError } = await supabase
      .from('leads')
      .insert({
        event_id: event.id,
        package_id: validatedData.package_id,
        vendor_id: validatedData.vendor_id,
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

    // Store quote items as initial message if provided
    if (validatedData.items && validatedData.items.length > 0 || validatedData.message) {
      let messageContent = '';

      if (validatedData.message) {
        messageContent += validatedData.message + '\n\n';
      }

      if (validatedData.items && validatedData.items.length > 0) {
        messageContent += '📋 Selected Items:\n';
        validatedData.items.forEach(item => {
          messageContent += `• ${item.quantity}x ${item.name} - $${(item.price * item.quantity).toFixed(2)}`;
          if (item.special_instructions) {
            messageContent += ` (Note: ${item.special_instructions})`;
          }
          messageContent += '\n';
        });
        messageContent += `\n💰 Estimated Total: $${validatedData.subtotal?.toFixed(2) || '0.00'}`;
      }

      if (messageContent) {
        await supabase
          .from('messages')
          .insert({
            lead_id: lead.id,
            sender_id: user.id,
            receiver_id: pkg.vendors.user_id,
            content: messageContent,
          });
      }
    }

    // Send notifications to vendor
    const leadUrl = `${process.env.NEXT_PUBLIC_APP_URL}/vendor/leads/${lead.id}`;

    try {
      await sendLeadNotification({
        vendorName: pkg.vendors.business_name,
        vendorEmail: pkg.vendors.users.email,
        vendorPhone: pkg.vendors.users.phone || '',
        eventDate: eventDate,
        guestCount: guestCount,
        budget: budget,
        leadUrl,
        plannerOrganization: planner?.organization || 'Unknown Organization',
      });
    } catch (notificationError) {
      // Log but don't fail the request if notification fails
      console.error('Failed to send notification:', notificationError);
    }

    return NextResponse.json(
      {
        data: {
          lead,
          event,
          message: 'Quote request sent successfully'
        },
        error: null
      },
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

    // Get all quote requests (leads) for the current user as a planner
    const { data: quotes, error } = await supabase
      .from('leads')
      .select(`
        *,
        events(*),
        packages(*),
        vendors(business_name, location_address)
      `)
      .eq('planner_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching quotes:', error);
      return NextResponse.json(
        { data: null, error: { message: error.message, code: 'DB_ERROR' } },
        { status: 500 }
      );
    }

    return NextResponse.json({ data: quotes, error: null }, { status: 200 });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { data: null, error: { message: 'Internal server error', code: 'INTERNAL_ERROR' } },
      { status: 500 }
    );
  }
}
