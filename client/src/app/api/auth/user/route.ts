/**
 * Get Current User Profile
 * GET /api/auth/user
 */

import { createClient } from '@/lib/supabase/route-handler';
import { getCurrentUserProfile } from '@/lib/supabase/queries';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const supabase = createClient();

    // Get user profile
    const { data, error } = await getCurrentUserProfile(supabase);

    if (error) {
      if (error.message?.includes('JWT') || error.message?.includes('auth')) {
        return NextResponse.json(
          { data: null, error: { message: 'Unauthorized', code: 'AUTH_ERROR' } },
          { status: 401 }
        );
      }

      console.error('Error fetching user profile:', error);
      return NextResponse.json(
        { data: null, error: { message: error.message, code: 'DB_ERROR' } },
        { status: 500 }
      );
    }

    if (!data) {
      return NextResponse.json(
        { data: null, error: { message: 'User profile not found', code: 'NOT_FOUND' } },
        { status: 404 }
      );
    }

    return NextResponse.json({ data, error: null }, { status: 200 });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { data: null, error: { message: 'Internal server error', code: 'INTERNAL_ERROR' } },
      { status: 500 }
    );
  }
}
