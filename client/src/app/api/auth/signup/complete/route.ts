/**
 * Complete User Signup
 * Creates user profile after OAuth authentication
 * POST /api/auth/signup/complete
 */

import { createClient } from '@/lib/supabase/route-handler';
import { NextResponse } from 'next/server';
import { z } from 'zod';

// Validation schema
const signupSchema = z.object({
  role: z.enum(['planner', 'vendor'], {
    required_error: 'Role is required',
  }),
  organization: z.string().optional(),
  phone: z.string().optional(),
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
    const validatedData = signupSchema.parse(body);

    // Validate role-specific requirements
    if (validatedData.role === 'planner' && !validatedData.organization) {
      return NextResponse.json(
        { data: null, error: { message: 'Organization is required for planners', code: 'VALIDATION_ERROR' } },
        { status: 400 }
      );
    }

    if (validatedData.role === 'vendor' && !validatedData.phone) {
      return NextResponse.json(
        { data: null, error: { message: 'Phone number is required for vendors', code: 'VALIDATION_ERROR' } },
        { status: 400 }
      );
    }

    // Check if user profile already exists
    const { data: existing } = await supabase
      .from('users')
      .select('id')
      .eq('id', user.id)
      .single();

    if (existing) {
      return NextResponse.json(
        { data: null, error: { message: 'Profile already exists', code: 'ALREADY_EXISTS' } },
        { status: 400 }
      );
    }

    // Create user profile
    const { data: userProfile, error: userError } = await supabase
      .from('users')
      .insert({
        id: user.id,
        email: user.email!,
        full_name: user.user_metadata.full_name || user.email!.split('@')[0],
        role: validatedData.role,
        organization: validatedData.organization || null,
        phone: validatedData.phone || null,
      })
      .select()
      .single();

    if (userError) {
      console.error('Error creating user profile:', userError);
      return NextResponse.json(
        { data: null, error: { message: userError.message, code: 'DB_ERROR' } },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { data: userProfile, error: null },
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
