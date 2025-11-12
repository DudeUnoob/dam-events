/**
 * Admin Vendor Analytics API Route
 * GET /api/admin/vendors/analytics - Get detailed vendor performance metrics
 */

import { createClient } from '@/lib/supabase/route-handler';
import { NextResponse } from 'next/server';

interface VendorAnalytics {
  vendor_id: string;
  business_name: string;
  email: string;
  status: string;
  package_count: number;
  lead_count: number;
  booked_count: number;
  conversion_rate: number;
  avg_response_time_hours: number | null;
  created_at: string;
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

    // Fetch all vendors with their user info
    const { data: vendors, error: vendorsError } = await supabase
      .from('vendors')
      .select(`
        id,
        business_name,
        status,
        created_at,
        users!inner (
          email
        )
      `)
      .order('created_at', { ascending: false });

    if (vendorsError) {
      console.error('Error fetching vendors:', vendorsError);
      return NextResponse.json(
        { data: null, error: { message: vendorsError.message, code: 'DB_ERROR' } },
        { status: 500 }
      );
    }

    // Calculate analytics for each vendor
    const analytics: VendorAnalytics[] = await Promise.all(
      vendors.map(async (vendor) => {
        // Count packages
        const { count: packageCount } = await supabase
          .from('packages')
          .select('id', { count: 'exact', head: true })
          .eq('vendor_id', vendor.id);

        // Count total leads
        const { count: leadCount } = await supabase
          .from('leads')
          .select('id', { count: 'exact', head: true })
          .eq('vendor_id', vendor.id);

        // Count booked leads
        const { count: bookedCount } = await supabase
          .from('leads')
          .select('id', { count: 'exact', head: true })
          .eq('vendor_id', vendor.id)
          .eq('status', 'booked');

        // Calculate conversion rate
        const conversionRate = leadCount && leadCount > 0
          ? ((bookedCount || 0) / leadCount) * 100
          : 0;

        // Calculate average response time in hours
        const { data: leadsWithTimes } = await supabase
          .from('leads')
          .select('created_at, responded_at')
          .eq('vendor_id', vendor.id)
          .not('responded_at', 'is', null);

        let avgResponseTimeHours: number | null = null;
        if (leadsWithTimes && leadsWithTimes.length > 0) {
          const responseTimes = leadsWithTimes.map(lead => {
            const created = new Date(lead.created_at).getTime();
            const responded = new Date(lead.responded_at!).getTime();
            return (responded - created) / (1000 * 60 * 60); // Convert ms to hours
          });
          avgResponseTimeHours = responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length;
        }

        return {
          vendor_id: vendor.id,
          business_name: vendor.business_name,
          email: (vendor.users as any)?.email || 'N/A',
          status: vendor.status,
          package_count: packageCount || 0,
          lead_count: leadCount || 0,
          booked_count: bookedCount || 0,
          conversion_rate: Number(conversionRate.toFixed(1)),
          avg_response_time_hours: avgResponseTimeHours ? Number(avgResponseTimeHours.toFixed(1)) : null,
          created_at: vendor.created_at,
        };
      })
    );

    return NextResponse.json({ data: analytics, error: null }, { status: 200 });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { data: null, error: { message: 'Internal server error', code: 'INTERNAL_ERROR' } },
      { status: 500 }
    );
  }
}
