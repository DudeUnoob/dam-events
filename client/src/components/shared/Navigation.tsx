'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Calendar, Menu, X, LayoutDashboard, Package, MessageSquare, LogOut, User } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';

export function Navigation() {
  const pathname = usePathname();
  const { user, loading, signOut } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  // Don't show navigation on auth pages
  if (pathname?.startsWith('/login') || pathname?.startsWith('/signup')) {
    return null;
  }

  return (
    <nav className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <Calendar className="h-8 w-8 text-primary-600" />
            <span className="text-xl font-bold text-slate-900">DAM Events</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden items-center gap-6 md:flex">
            {!loading && user ? (
              <>
                {/* Authenticated Navigation */}
                <Link
                  href={user.role === 'vendor' ? '/vendor/dashboard' : user.role === 'admin' ? '/admin/dashboard' : '/planner/dashboard'}
                  className="text-sm font-medium text-slate-700 transition-colors hover:text-primary-600"
                >
                  <LayoutDashboard className="inline h-4 w-4 mr-1.5" />
                  Dashboard
                </Link>

                {user.role === 'planner' && (
                  <Link
                    href="/planner/browse"
                    className="text-sm font-medium text-slate-700 transition-colors hover:text-primary-600"
                  >
                    <Package className="inline h-4 w-4 mr-1.5" />
                    Browse Packages
                  </Link>
                )}

                {user.role === 'vendor' && (
                  <Link
                    href="/vendor/packages"
                    className="text-sm font-medium text-slate-700 transition-colors hover:text-primary-600"
                  >
                    <Package className="inline h-4 w-4 mr-1.5" />
                    My Packages
                  </Link>
                )}

                <Link
                  href="/messages"
                  className="text-sm font-medium text-slate-700 transition-colors hover:text-primary-600"
                >
                  <MessageSquare className="inline h-4 w-4 mr-1.5" />
                  Messages
                </Link>

                {/* User Menu */}
                <div className="relative">
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
                  >
                    <User className="h-4 w-4" />
                    <span className="hidden lg:inline">{user.full_name}</span>
                  </button>

                  {userMenuOpen && (
                    <>
                      <div
                        className="fixed inset-0 z-10"
                        onClick={() => setUserMenuOpen(false)}
                      />
                      <div className="absolute right-0 z-20 mt-2 w-56 rounded-lg border border-slate-200 bg-white shadow-lg">
                        <div className="p-3 border-b border-slate-100">
                          <p className="text-sm font-medium text-slate-900">{user.full_name}</p>
                          <p className="text-xs text-slate-500">{user.email}</p>
                          <p className="mt-1 text-xs text-primary-600 capitalize">{user.role}</p>
                        </div>
                        <div className="p-1">
                          <button
                            onClick={() => {
                              setUserMenuOpen(false);
                              signOut();
                            }}
                            className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-slate-700 hover:bg-red-50 hover:text-red-600"
                          >
                            <LogOut className="h-4 w-4" />
                            Sign Out
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </>
            ) : (
              <>
                {/* Unauthenticated Navigation */}
                <Link
                  href="/planner/browse"
                  className="text-sm font-medium text-slate-700 transition-colors hover:text-primary-600"
                >
                  Browse Packages
                </Link>
                <Link
                  href="/signup?role=vendor"
                  className="text-sm font-medium text-slate-700 transition-colors hover:text-primary-600"
                >
                  List Your Venue
                </Link>
                <div className="flex items-center gap-3">
                  <Button variant="ghost" size="sm" asChild>
                    <Link href="/login">Sign In</Link>
                  </Button>
                  <Button size="sm" asChild>
                    <Link href="/signup">Get Started</Link>
                  </Button>
                </div>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? (
              <X className="h-6 w-6 text-slate-700" />
            ) : (
              <Menu className="h-6 w-6 text-slate-700" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="border-t border-slate-200 md:hidden">
          <div className="space-y-1 px-4 pb-3 pt-2">
            {!loading && user ? (
              <>
                {/* Authenticated Mobile Nav */}
                <Link
                  href={user.role === 'vendor' ? '/vendor/dashboard' : user.role === 'admin' ? '/admin/dashboard' : '/planner/dashboard'}
                  className="flex items-center gap-2 rounded-lg px-3 py-2 text-base font-medium text-slate-700 hover:bg-slate-100"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <LayoutDashboard className="h-4 w-4" />
                  Dashboard
                </Link>

                {user.role === 'planner' && (
                  <Link
                    href="/planner/browse"
                    className="flex items-center gap-2 rounded-lg px-3 py-2 text-base font-medium text-slate-700 hover:bg-slate-100"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Package className="h-4 w-4" />
                    Browse Packages
                  </Link>
                )}

                {user.role === 'vendor' && (
                  <Link
                    href="/vendor/packages"
                    className="flex items-center gap-2 rounded-lg px-3 py-2 text-base font-medium text-slate-700 hover:bg-slate-100"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Package className="h-4 w-4" />
                    My Packages
                  </Link>
                )}

                <Link
                  href="/messages"
                  className="flex items-center gap-2 rounded-lg px-3 py-2 text-base font-medium text-slate-700 hover:bg-slate-100"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <MessageSquare className="h-4 w-4" />
                  Messages
                </Link>

                <div className="border-t border-slate-200 pt-4 mt-4">
                  <div className="px-3 py-2">
                    <p className="text-sm font-medium text-slate-900">{user.full_name}</p>
                    <p className="text-xs text-slate-500">{user.email}</p>
                    <p className="mt-1 text-xs text-primary-600 capitalize">{user.role}</p>
                  </div>
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      signOut();
                    }}
                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-base font-medium text-red-600 hover:bg-red-50"
                  >
                    <LogOut className="h-4 w-4" />
                    Sign Out
                  </button>
                </div>
              </>
            ) : (
              <>
                {/* Unauthenticated Mobile Nav */}
                <Link
                  href="/planner/browse"
                  className="block rounded-lg px-3 py-2 text-base font-medium text-slate-700 hover:bg-slate-100"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Browse Packages
                </Link>
                <Link
                  href="/signup?role=vendor"
                  className="block rounded-lg px-3 py-2 text-base font-medium text-slate-700 hover:bg-slate-100"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  List Your Venue
                </Link>
                <div className="flex flex-col gap-2 pt-4">
                  <Button variant="ghost" asChild>
                    <Link href="/login">Sign In</Link>
                  </Button>
                  <Button asChild>
                    <Link href="/signup">Get Started</Link>
                  </Button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
