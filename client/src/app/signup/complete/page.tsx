'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Calendar, Users, Building2, AlertCircle, Loader2 } from 'lucide-react';

export default function SignupCompletePage() {
  const router = useRouter();
  const [role, setRole] = useState<'planner' | 'vendor' | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form fields
  const [organization, setOrganization] = useState('');
  const [phone, setPhone] = useState('');

  useEffect(() => {
    // Get role from sessionStorage
    const savedRole = sessionStorage.getItem('signup_role') as 'planner' | 'vendor' | null;
    if (savedRole) {
      setRole(savedRole);
    } else {
      // If no role found, redirect to signup
      router.push('/signup');
    }
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!role) return;

    // Validation
    if (role === 'planner' && !organization.trim()) {
      setError('Organization name is required');
      return;
    }

    if (role === 'vendor' && !phone.trim()) {
      setError('Phone number is required');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const payload: any = { role };
      if (role === 'planner') {
        payload.organization = organization.trim();
      } else {
        payload.phone = phone.trim();
      }

      const response = await fetch('/api/auth/signup/complete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok || data.error) {
        throw new Error(data.error?.message || 'Failed to complete signup');
      }

      // Clear role from sessionStorage
      sessionStorage.removeItem('signup_role');

      // Redirect based on role
      if (role === 'vendor') {
        router.push('/vendor/onboarding');
      } else {
        router.push('/planner/dashboard');
      }
    } catch (err: any) {
      console.error('Error completing signup:', err);
      setError(err.message || 'Failed to complete signup. Please try again.');
      setLoading(false);
    }
  };

  if (!role) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-primary-50 via-white to-accent-50 px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="mb-8 text-center">
          <div className="inline-flex items-center gap-2">
            <Calendar className="h-10 w-10 text-primary-600" />
            <span className="text-2xl font-bold text-slate-900">DAM Events</span>
          </div>
        </div>

        <Card variant="elevated">
          <CardHeader className="text-center">
            <CardTitle>Complete Your Profile</CardTitle>
            <CardDescription>
              {role === 'planner'
                ? 'Tell us about your organization'
                : 'Set up your vendor profile'}
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Error Message */}
              {error && (
                <div className="rounded-lg bg-red-50 border border-red-200 p-3 flex items-start gap-2">
                  <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-red-800">{error}</p>
                </div>
              )}

              {/* Role Badge */}
              <div className="rounded-lg bg-slate-50 p-4">
                <div className="flex items-center gap-3">
                  {role === 'planner' ? (
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
              </div>

              {/* Form Fields */}
              {role === 'planner' ? (
                <div>
                  <Input
                    label="Organization Name"
                    type="text"
                    placeholder="e.g., Alpha Beta Gamma Sorority"
                    value={organization}
                    onChange={(e) => setOrganization(e.target.value)}
                    required
                    disabled={loading}
                  />
                  <p className="mt-2 text-xs text-slate-500">
                    This will be visible to vendors when you request quotes
                  </p>
                </div>
              ) : (
                <div>
                  <Input
                    label="Phone Number"
                    type="tel"
                    placeholder="(512) 555-0123"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                    disabled={loading}
                  />
                  <p className="mt-2 text-xs text-slate-500">
                    For receiving lead notifications. Next, you&apos;ll create your vendor profile.
                  </p>
                </div>
              )}

              {/* Submit Button */}
              <Button type="submit" className="w-full" size="lg" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Creating Profile...
                  </>
                ) : (
                  'Complete Signup'
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
