/**
 * Google OAuth Callback Handler
 * Handles the redirect from Google OAuth and exchanges code for session
 */

import { createClient } from '@/lib/supabase/route-handler';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');

  if (code) {
    const supabase = createClient();
    await supabase.auth.exchangeCodeForSession(code);
  }

  // Check if user has completed profile setup
  const supabase = createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    // Redirect to login if auth failed
    return NextResponse.redirect(`${requestUrl.origin}/login?error=auth_failed`);
  }

  // Check if user profile exists
  const { data: profile, error: profileError } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .maybeSingle();

  // If profile doesn't exist, redirect to complete signup
  if (profileError || !profile?.role) {
    return NextResponse.redirect(`${requestUrl.origin}/signup/complete`);
  }

  // Redirect to appropriate dashboard based on role
  const dashboardPaths: Record<string, string> = {
    planner: '/planner/dashboard',
    vendor: '/vendor/dashboard',
    admin: '/admin/dashboard',
  };

  const redirectPath = dashboardPaths[profile.role] || '/';
  return NextResponse.redirect(`${requestUrl.origin}${redirectPath}`);
}
