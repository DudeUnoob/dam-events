/**
 * Message API Routes
 * POST /api/messages - Send message + notification
 * GET /api/messages?leadId=[id] - Get messages for a lead
 */

import { createClient } from '@/lib/supabase/route-handler';
import { sendMessageNotification } from '@/lib/notifications';
import { NextResponse } from 'next/server';
import { z } from 'zod';

// Validation schema
const messageSchema = z.object({
  leadId: z.string().uuid(),
  content: z.string().min(1, 'Message content is required').max(2000, 'Message too long (max 2000 characters)'),
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
    const validatedData = messageSchema.parse(body);

    // Get lead and determine receiver
    const { data: lead, error: leadError } = await supabase
      .from('leads')
      .select(`
        *,
        vendors!inner(user_id),
        users!leads_planner_id_fkey(full_name, email)
      `)
      .eq('id', validatedData.leadId)
      .single();

    if (leadError) {
      return NextResponse.json(
        { data: null, error: { message: 'Lead not found', code: 'NOT_FOUND' } },
        { status: 404 }
      );
    }

    // Determine sender and receiver
    const isPlanner = lead.planner_id === user.id;
    const isVendor = lead.vendors.user_id === user.id;

    if (!isPlanner && !isVendor) {
      return NextResponse.json(
        { data: null, error: { message: 'You are not part of this conversation', code: 'FORBIDDEN' } },
        { status: 403 }
      );
    }

    const receiverId = isPlanner ? lead.vendors.user_id : lead.planner_id;

    // Get sender info
    const { data: sender } = await supabase
      .from('users')
      .select('full_name, email')
      .eq('id', user.id)
      .single();

    // Get receiver info
    const { data: receiver } = await supabase
      .from('users')
      .select('full_name, email')
      .eq('id', receiverId)
      .single();

    // Create message
    const { data: message, error: messageError } = await supabase
      .from('messages')
      .insert({
        lead_id: validatedData.leadId,
        sender_id: user.id,
        receiver_id: receiverId,
        content: validatedData.content,
        read: false,
      })
      .select()
      .single();

    if (messageError) {
      console.error('Error creating message:', messageError);
      return NextResponse.json(
        { data: null, error: { message: messageError.message, code: 'DB_ERROR' } },
        { status: 500 }
      );
    }

    // Send notification to receiver (stubbed for now)
    const leadUrl = isPlanner
      ? `${process.env.NEXT_PUBLIC_APP_URL}/vendor/leads/${lead.id}`
      : `${process.env.NEXT_PUBLIC_APP_URL}/planner/leads/${lead.id}`;

    await sendMessageNotification({
      recipientEmail: receiver?.email || '',
      recipientName: receiver?.full_name || 'User',
      senderName: sender?.full_name || 'Someone',
      messagePreview: validatedData.content.substring(0, 100),
      leadUrl,
    });

    // Auto-update lead status to 'quoted' if vendor sends first message
    if (isVendor && lead.status === 'new') {
      await supabase
        .from('leads')
        .update({ status: 'quoted' })
        .eq('id', validatedData.leadId);
    }

    return NextResponse.json({ data: message, error: null }, { status: 201 });
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
    const leadId = searchParams.get('leadId');

    if (!leadId) {
      return NextResponse.json(
        { data: null, error: { message: 'leadId query parameter is required', code: 'VALIDATION_ERROR' } },
        { status: 400 }
      );
    }

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { data: null, error: { message: 'Unauthorized', code: 'AUTH_ERROR' } },
        { status: 401 }
      );
    }

    // Verify access to lead
    const { data: lead, error: leadError } = await supabase
      .from('leads')
      .select('*, vendors!inner(user_id)')
      .eq('id', leadId)
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
        { data: null, error: { message: 'You do not have access to these messages', code: 'FORBIDDEN' } },
        { status: 403 }
      );
    }

    // Get messages
    const { data: messages, error: messagesError } = await supabase
      .from('messages')
      .select('*')
      .eq('lead_id', leadId)
      .order('created_at', { ascending: true });

    if (messagesError) {
      console.error('Error fetching messages:', messagesError);
      return NextResponse.json(
        { data: null, error: { message: messagesError.message, code: 'DB_ERROR' } },
        { status: 500 }
      );
    }

    return NextResponse.json({ data: messages, error: null }, { status: 200 });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { data: null, error: { message: 'Internal server error', code: 'INTERNAL_ERROR' } },
      { status: 500 }
    );
  }
}
