'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Menu, X, LayoutDashboard, Package, MessageSquare, LogOut, User, Settings, Home, Receipt, UserCircle } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';

// Scout Logo Icon
const ScoutIcon = () => (
  <svg width="41" height="45" viewBox="0 0 41 45" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="0" y="20" width="14.8" height="16.683" rx="2" fill="#232834" transform="rotate(-90 0 20)"/>
    <rect x="26.2" y="45" width="14.8" height="16.683" rx="2" fill="#232834" transform="rotate(-90 26.2 45)"/>
    <circle cx="9" cy="9" r="4" fill="#232834"/>
    <circle cx="20.5" cy="21" r="4" fill="#232834"/>
    <circle cx="32" cy="36" r="4" fill="#232834"/>
    <circle cx="20.5" cy="33" r="4" fill="#232834"/>
  </svg>
);

export function Navigation() {
  const pathname = usePathname();
  const { user, loading, signOut } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  // Fetch unread message count
  useEffect(() => {
    const fetchUnreadCount = async () => {
      if (!user) return;

      try {
        const response = await fetch('/api/messages/unread');
        const data = await response.json();

        if (response.ok && data.data) {
          setUnreadCount(data.data.count);
        }
      } catch (err) {
        console.error('Error fetching unread count:', err);
      }
    };

    fetchUnreadCount();

    // Poll every 30 seconds for new messages
    const interval = setInterval(fetchUnreadCount, 30000);

    return () => clearInterval(interval);
  }, [user]);

  // Don't show navigation on auth pages
  if (pathname?.startsWith('/login') || pathname?.startsWith('/signup')) {
    return null;
  }

  // Check if we're on the discovery page (home or browse)
  const isDiscoveryPage = pathname === '/' || pathname === '/planner/browse';

  return (
    <nav className="sticky top-0 z-50 border-b border-black bg-white shadow-[0px_2px_2px_0px_rgba(0,0,0,0.25)]">
      <div className="mx-auto max-w-[1512px] px-4 sm:px-6 lg:px-[37px]">
        <div className="flex h-[66px] items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <ScoutIcon />
            <span className="text-[26px] font-medium text-black font-urbanist">
              scout
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden items-center gap-3 md:flex">
            {!loading && user ? (
              <>
                {/* Home Icon - Active state with dark bg */}
                <Link
                  href="/"
                  className={`p-[7px] rounded-[20px] transition-colors ${
                    pathname === '/' ? 'bg-[#232834]' : 'bg-[#f2f4f8] hover:bg-slate-200'
                  }`}
                >
                  <Home className={`h-[27px] w-[27px] ${pathname === '/' ? 'text-white' : 'text-[#545f71]'}`} strokeWidth={1.5} />
                </Link>

                {/* Leads/Receipts Icon */}
                <Link
                  href={user.role === 'vendor' ? '/vendor/dashboard' : '/planner/dashboard'}
                  className="p-[7px] rounded-[20px] bg-[#f2f4f8] hover:bg-slate-200 transition-colors"
                >
                  <Receipt className="h-[27px] w-[27px] text-[#545f71]" strokeWidth={1.5} />
                </Link>

                {/* Messages Icon */}
                <Link
                  href="/messages"
                  className="relative p-[6px] rounded-[20px] bg-[#f2f4f8] hover:bg-slate-200 transition-colors"
                >
                  <MessageSquare className="h-[29px] w-[29px] text-[#545f71]" strokeWidth={1.5} />
                  {unreadCount > 0 && (
                    <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-600 text-xs font-bold text-white">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </Link>

                {/* Profile Icon */}
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="p-[6px] rounded-[20px] bg-[#f2f4f8] hover:bg-slate-200 transition-colors"
                >
                  <UserCircle className="h-[27px] w-[27px] text-[#545f71]" strokeWidth={1.5} />
                </button>

                {userMenuOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-10"
                      onClick={() => setUserMenuOpen(false)}
                    />
                    <div className="absolute right-[37px] top-[60px] z-20 w-56 rounded-lg border border-slate-200 bg-white shadow-lg">
                      <div className="p-3 border-b border-slate-100">
                        <p className="text-sm font-medium text-slate-900">{user.full_name}</p>
                        <p className="text-xs text-slate-500">{user.email}</p>
                        <p className="mt-1 text-xs text-primary-600 capitalize">{user.role}</p>
                      </div>
                      <div className="p-1">
                        {user.role === 'planner' && (
                          <Link
                            href="/planner/profile"
                            onClick={() => setUserMenuOpen(false)}
                            className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
                          >
                            <Settings className="h-4 w-4" />
                            Profile Settings
                          </Link>
                        )}
                        {user.role === 'vendor' && (
                          <Link
                            href="/vendor/profile"
                            onClick={() => setUserMenuOpen(false)}
                            className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
                          >
                            <Settings className="h-4 w-4" />
                            Profile Settings
                          </Link>
                        )}
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
              </>
            ) : (
              <>
                {/* Unauthenticated Navigation */}
                <Link
                  href="/"
                  className={`p-[7px] rounded-[20px] transition-colors ${
                    pathname === '/' ? 'bg-[#232834]' : 'bg-[#f2f4f8] hover:bg-slate-200'
                  }`}
                >
                  <Home className={`h-[27px] w-[27px] ${pathname === '/' ? 'text-white' : 'text-[#545f71]'}`} strokeWidth={1.5} />
                </Link>

                <div className="p-[7px] rounded-[20px] bg-[#f2f4f8]">
                  <Receipt className="h-[27px] w-[27px] text-[#545f71]" strokeWidth={1.5} />
                </div>

                <div className="p-[6px] rounded-[20px] bg-[#f2f4f8]">
                  <MessageSquare className="h-[29px] w-[29px] text-[#545f71]" strokeWidth={1.5} />
                </div>

                <div className="p-[6px] rounded-[20px] bg-[#f2f4f8]">
                  <UserCircle className="h-[27px] w-[27px] text-[#545f71]" strokeWidth={1.5} />
                </div>

                <Link
                  href="/login"
                  className="text-[16px] font-normal text-black hover:text-slate-600 transition-colors"
                >
                  Sign in/Register
                </Link>
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
                  href="/"
                  className="flex items-center gap-2 rounded-lg px-3 py-2 text-base font-medium text-slate-700 hover:bg-slate-100"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Home className="h-4 w-4" />
                  Home
                </Link>

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
                  className="relative flex items-center gap-2 rounded-lg px-3 py-2 text-base font-medium text-slate-700 hover:bg-slate-100"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <MessageSquare className="h-4 w-4" />
                  Messages
                  {unreadCount > 0 && (
                    <span className="ml-auto flex h-5 w-5 items-center justify-center rounded-full bg-red-600 text-xs font-bold text-white">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </Link>

                <div className="border-t border-slate-200 pt-4 mt-4">
                  <div className="px-3 py-2">
                    <p className="text-sm font-medium text-slate-900">{user.full_name}</p>
                    <p className="text-xs text-slate-500">{user.email}</p>
                    <p className="mt-1 text-xs text-primary-600 capitalize">{user.role}</p>
                  </div>
                  {user.role === 'planner' && (
                    <Link
                      href="/planner/profile"
                      className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-base font-medium text-slate-700 hover:bg-slate-100"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <Settings className="h-4 w-4" />
                      Profile Settings
                    </Link>
                  )}
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
                  href="/"
                  className="block rounded-lg px-3 py-2 text-base font-medium text-slate-700 hover:bg-slate-100"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Home
                </Link>
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
