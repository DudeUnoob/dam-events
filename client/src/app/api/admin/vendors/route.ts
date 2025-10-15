/**
 * Admin Vendor Management
 * GET /api/admin/vendors?status=pending - Get vendors by status
 */

import { createClient } from '@/lib/supabase/route-handler';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const supabase = createClient();
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { data: null, error: { message: 'Unauthorized', code: 'AUTH_ERROR' } },
        { status: 401 }
      );
    }

    // Verify user is an admin
    const { data: userProfile, error: profileError } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profileError || userProfile?.role !== 'admin') {
      return NextResponse.json(
        { data: null, error: { message: 'Admin access required', code: 'FORBIDDEN' } },
        { status: 403 }
      );
    }

    // Build query
    let query = supabase
      .from('vendors')
      .select(`
        *,
        users!inner(full_name, email, phone)
      `)
      .order('created_at', { ascending: false });

    // Filter by status if provided
    if (status) {
      query = query.eq('status', status);
    }

    const { data: vendors, error: vendorsError } = await query;

    if (vendorsError) {
      console.error('Error fetching vendors:', vendorsError);
      return NextResponse.json(
        { data: null, error: { message: vendorsError.message, code: 'DB_ERROR' } },
        { status: 500 }
      );
    }

    return NextResponse.json({ data: vendors, error: null }, { status: 200 });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { data: null, error: { message: 'Internal server error', code: 'INTERNAL_ERROR' } },
      { status: 500 }
    );
  }
}
