/**
 * Next.js Middleware for Authentication
 * Protects routes based on user authentication and role
 */

import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });

  // Refresh session if expired
  const { data: { session } } = await supabase.auth.getSession();

  const pathname = req.nextUrl.pathname;

  // Public routes that don't require authentication
  const publicRoutes = [
    '/',
    '/login',
    '/signup',
    '/auth/callback',
    '/api/auth/callback',
    '/api/packages', // Public package browsing
  ];

  const isPublicRoute = publicRoutes.some(route =>
    pathname === route || pathname.startsWith('/api/auth/')
  );

  // If not authenticated and trying to access protected route
  if (!session && !isPublicRoute) {
    const redirectUrl = req.nextUrl.clone();
    redirectUrl.pathname = '/login';
    redirectUrl.searchParams.set('redirectedFrom', pathname);
    return NextResponse.redirect(redirectUrl);
  }

  // If authenticated, check role-based access
  if (session) {
    const { data: user } = await supabase
      .from('users')
      .select('role')
      .eq('id', session.user.id)
      .single();

    // Planner-only routes
    if (pathname.startsWith('/planner') && user?.role !== 'planner') {
      return NextResponse.redirect(new URL('/', req.url));
    }

    // Vendor-only routes
    if (pathname.startsWith('/vendor') && user?.role !== 'vendor') {
      return NextResponse.redirect(new URL('/', req.url));
    }

    // Admin-only routes
    if (pathname.startsWith('/admin') && user?.role !== 'admin') {
      return NextResponse.redirect(new URL('/', req.url));
    }

    // API route protection (basic - RLS provides real security)
    if (pathname.startsWith('/api/admin') && user?.role !== 'admin') {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }
  }

  return res;
}

// Configure which routes use this middleware
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
