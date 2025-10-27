/**
 * Mark Message as Read
 * PUT /api/messages/[id]/read
 */

import { createClient } from '@/lib/supabase/route-handler';
import { NextResponse } from 'next/server';

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

    // Get message
    const { data: message, error: messageError } = await supabase
      .from('messages')
      .select('*')
      .eq('id', id)
      .single();

    if (messageError) {
      return NextResponse.json(
        { data: null, error: { message: 'Message not found', code: 'NOT_FOUND' } },
        { status: 404 }
      );
    }

    // Verify user is the receiver
    if (message.receiver_id !== user.id) {
      return NextResponse.json(
        { data: null, error: { message: 'You can only mark your own messages as read', code: 'FORBIDDEN' } },
        { status: 403 }
      );
    }

    // Mark as read
    const { data: updatedMessage, error: updateError } = await supabase
      .from('messages')
      .update({ read: true })
      .eq('id', id)
      .select()
      .single();

    if (updateError) {
      console.error('Error marking message as read:', updateError);
      return NextResponse.json(
        { data: null, error: { message: updateError.message, code: 'DB_ERROR' } },
        { status: 500 }
      );
    }

    return NextResponse.json({ data: updatedMessage, error: null }, { status: 200 });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { data: null, error: { message: 'Internal server error', code: 'INTERNAL_ERROR' } },
      { status: 500 }
    );
  }
}
