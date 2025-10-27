/**
 * Admin Stats API Route
 * GET /api/admin/stats - Get platform statistics
 */

import { createClient } from '@/lib/supabase/route-handler';
import { NextResponse } from 'next/server';

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

    // Verify admin role
    const { data: userProfile } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .maybeSingle();

    if (userProfile?.role !== 'admin') {
      return NextResponse.json(
        { data: null, error: { message: 'Admin access required', code: 'FORBIDDEN' } },
        { status: 403 }
      );
    }

    // Fetch statistics in parallel
    const [
      pendingVendorsResult,
      verifiedVendorsResult,
      activePackagesResult,
      totalUsersResult,
    ] = await Promise.all([
      // Pending vendors count
      supabase
        .from('vendors')
        .select('id', { count: 'exact', head: true })
        .eq('status', 'pending'),

      // Verified vendors count
      supabase
        .from('vendors')
        .select('id', { count: 'exact', head: true })
        .eq('status', 'verified'),

      // Active (published) packages count
      supabase
        .from('packages')
        .select('id', { count: 'exact', head: true })
        .eq('status', 'published'),

      // Total users count
      supabase
        .from('users')
        .select('id', { count: 'exact', head: true }),
    ]);

    const stats = {
      pendingVendors: pendingVendorsResult.count || 0,
      verifiedVendors: verifiedVendorsResult.count || 0,
      activePackages: activePackagesResult.count || 0,
      totalUsers: totalUsersResult.count || 0,
    };

    return NextResponse.json({ data: stats, error: null }, { status: 200 });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { data: null, error: { message: 'Internal server error', code: 'INTERNAL_ERROR' } },
      { status: 500 }
    );
  }
}
