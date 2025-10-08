'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Calendar, Users, Building2 } from 'lucide-react';
import { useState } from 'react';

export default function SignupPage() {
  const searchParams = useSearchParams();
  const defaultRole = searchParams.get('role') as 'planner' | 'vendor' | null;
  const [selectedRole, setSelectedRole] = useState<'planner' | 'vendor' | null>(defaultRole);

  const handleGoogleSignup = async () => {
    // TODO: Implement Supabase Google OAuth with role
    console.log('Google signup clicked with role:', selectedRole);
  };

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-gradient-to-br from-primary-50 via-white to-accent-50 px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-2xl">
        {/* Logo */}
        <div className="mb-8 text-center">
          <Link href="/" className="inline-flex items-center gap-2">
            <Calendar className="h-10 w-10 text-primary-600" />
            <span className="text-2xl font-bold text-slate-900">DAM Events</span>
          </Link>
        </div>

        <Card variant="elevated">
          <CardHeader className="text-center">
            <CardTitle>Get Started</CardTitle>
            <CardDescription>Choose how you want to use DAM Events</CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Role Selection */}
            {!selectedRole && (
              <div className="grid gap-4 md:grid-cols-2">
                <button
                  onClick={() => setSelectedRole('planner')}
                  className="group relative rounded-xl border-2 border-slate-200 p-6 text-left transition-all hover:border-primary-300 hover:bg-primary-50"
                >
                  <div className="flex items-start gap-4">
                    <div className="rounded-lg bg-primary-100 p-3 group-hover:bg-primary-200">
                      <Users className="h-6 w-6 text-primary-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-slate-900">I&apos;m a Planner</h3>
                      <p className="mt-1 text-sm text-slate-600">
                        Find and book complete event packages for your organization
                      </p>
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => setSelectedRole('vendor')}
                  className="group relative rounded-xl border-2 border-slate-200 p-6 text-left transition-all hover:border-secondary-300 hover:bg-secondary-50"
                >
                  <div className="flex items-start gap-4">
                    <div className="rounded-lg bg-secondary-100 p-3 group-hover:bg-secondary-200">
                      <Building2 className="h-6 w-6 text-secondary-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-slate-900">I&apos;m a Vendor</h3>
                      <p className="mt-1 text-sm text-slate-600">
                        List your venue and receive qualified event leads
                      </p>
                    </div>
                  </div>
                </button>
              </div>
            )}

            {/* Selected Role Info */}
            {selectedRole && (
              <>
                <div className="rounded-lg bg-slate-50 p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {selectedRole === 'planner' ? (
                        <>
                          <div className="rounded-lg bg-primary-100 p-2">
                            <Users className="h-5 w-5 text-primary-600" />
                          </div>
                          <div>
                            <p className="font-medium text-slate-900">Event Planner</p>
                            <p className="text-sm text-slate-600">
                              Browse packages and request quotes
                            </p>
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="rounded-lg bg-secondary-100 p-2">
                            <Building2 className="h-5 w-5 text-secondary-600" />
                          </div>
                          <div>
                            <p className="font-medium text-slate-900">Vendor</p>
                            <p className="text-sm text-slate-600">List your venue and get leads</p>
                          </div>
                        </>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedRole(null)}
                    >
                      Change
                    </Button>
                  </div>
                </div>

                {/* Google Sign Up Button */}
                <Button
                  onClick={handleGoogleSignup}
                  className="w-full"
                  size="lg"
                >
                  <svg className="mr-2 h-5 w-5" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                  Continue with Google
                </Button>

                <p className="text-center text-xs text-slate-500">
                  By continuing, you agree to our Terms of Service and Privacy Policy
                </p>
              </>
            )}

            {/* Sign In Link */}
            <p className="text-center text-sm text-slate-600">
              Already have an account?{' '}
              <Link href="/login" className="font-semibold text-primary-600 hover:text-primary-700">
                Sign in
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
