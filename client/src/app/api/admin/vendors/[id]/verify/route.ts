/**
 * Admin Vendor Verification
 * PUT /api/admin/vendors/[id]/verify - Approve or reject vendor
 */

import { createClient } from '@/lib/supabase/route-handler';
import { sendVendorVerificationNotification } from '@/lib/notifications';
import { NextResponse } from 'next/server';
import { z } from 'zod';

// Validation schema
const verifySchema = z.object({
  status: z.enum(['verified', 'rejected']),
  reason: z.string().optional(),
});

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

    // Parse and validate request body
    const body = await request.json();
    const validatedData = verifySchema.parse(body);

    // Get vendor details
    const { data: vendor, error: vendorError } = await supabase
      .from('vendors')
      .select(`
        *,
        users!inner(email)
      `)
      .eq('id', id)
      .single();

    if (vendorError) {
      return NextResponse.json(
        { data: null, error: { message: 'Vendor not found', code: 'NOT_FOUND' } },
        { status: 404 }
      );
    }

    // Update vendor status
    const { data: updatedVendor, error: updateError } = await supabase
      .from('vendors')
      .update({ status: validatedData.status })
      .eq('id', id)
      .select()
      .single();

    if (updateError) {
      console.error('Error updating vendor status:', updateError);
      return NextResponse.json(
        { data: null, error: { message: updateError.message, code: 'DB_ERROR' } },
        { status: 500 }
      );
    }

    // Send notification to vendor (stubbed for now)
    await sendVendorVerificationNotification(
      vendor.users.email,
      vendor.business_name,
      validatedData.status,
      validatedData.reason
    );

    return NextResponse.json({ data: updatedVendor, error: null }, { status: 200 });
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
