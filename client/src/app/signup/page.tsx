'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { AuthLayout } from '@/components/auth/AuthLayout';
import { AlertCircle, Users, Building2, Check } from 'lucide-react';

export default function SignupPage() {
  const searchParams = useSearchParams();
  const defaultRole = searchParams.get('role') as 'planner' | 'vendor' | null;
  const [selectedRole, setSelectedRole] = useState<'planner' | 'vendor' | null>(defaultRole);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const supabase = createClient();

  const handleGoogleSignup = async () => {
    if (!selectedRole) {
      setError('Please select how you want to use Scout');
      return;
    }

    if (!agreedToTerms) {
      setError('Please agree to the Terms of Use and Privacy Policy');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Store role in sessionStorage to pass to completion page
      sessionStorage.setItem('signup_role', selectedRole);

      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/api/auth/callback`,
        },
      });

      if (error) throw error;
    } catch (err: any) {
      console.error('Error signing up:', err);
      setError(err.message || 'Failed to sign up. Please try again.');
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-[36px] font-semibold text-black leading-tight">
          Sign up
        </h1>
        <p className="text-[12px] text-black mt-1">
          Welcome to Events - Let&apos;s create your account
        </p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 rounded-lg bg-red-50 border border-red-200 p-3 flex items-start gap-2">
          <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      {/* Role Selection */}
      <div className="space-y-4 mb-6">
        <p className="text-[16px] text-[#666666]">I want to...</p>

        {/* Planner Option */}
        <button
          onClick={() => setSelectedRole('planner')}
          className={`w-full flex items-center gap-4 p-4 rounded-[12px] border-2 transition-all text-left ${
            selectedRole === 'planner'
              ? 'border-[#111111] bg-slate-50'
              : 'border-[rgba(102,102,102,0.35)] hover:border-slate-400'
          }`}
        >
          <div className={`p-3 rounded-lg ${selectedRole === 'planner' ? 'bg-primary-100' : 'bg-slate-100'}`}>
            <Users className={`h-6 w-6 ${selectedRole === 'planner' ? 'text-primary-600' : 'text-slate-600'}`} />
          </div>
          <div className="flex-1">
            <h3 className="text-[16px] font-medium text-[#111111]">Find event venues</h3>
            <p className="text-[14px] text-[#666666]">I&apos;m planning an event</p>
          </div>
          {selectedRole === 'planner' && (
            <div className="p-1 bg-[#111111] rounded-full">
              <Check className="h-4 w-4 text-white" />
            </div>
          )}
        </button>

        {/* Vendor Option */}
        <button
          onClick={() => setSelectedRole('vendor')}
          className={`w-full flex items-center gap-4 p-4 rounded-[12px] border-2 transition-all text-left ${
            selectedRole === 'vendor'
              ? 'border-[#111111] bg-slate-50'
              : 'border-[rgba(102,102,102,0.35)] hover:border-slate-400'
          }`}
        >
          <div className={`p-3 rounded-lg ${selectedRole === 'vendor' ? 'bg-secondary-100' : 'bg-slate-100'}`}>
            <Building2 className={`h-6 w-6 ${selectedRole === 'vendor' ? 'text-secondary-600' : 'text-slate-600'}`} />
          </div>
          <div className="flex-1">
            <h3 className="text-[16px] font-medium text-[#111111]">List my venue</h3>
            <p className="text-[14px] text-[#666666]">I have a venue to rent</p>
          </div>
          {selectedRole === 'vendor' && (
            <div className="p-1 bg-[#111111] rounded-full">
              <Check className="h-4 w-4 text-white" />
            </div>
          )}
        </button>
      </div>

      {/* Terms Checkbox */}
      <div className="mb-6">
        <label className="flex items-start gap-3 cursor-pointer">
          <div className="relative mt-0.5">
            <input
              type="checkbox"
              checked={agreedToTerms}
              onChange={(e) => setAgreedToTerms(e.target.checked)}
              className="peer sr-only"
            />
            <div className={`w-6 h-6 border-2 rounded transition-colors ${
              agreedToTerms
                ? 'bg-[#111111] border-[#111111]'
                : 'border-[rgba(102,102,102,0.35)]'
            }`}>
              {agreedToTerms && (
                <Check className="h-5 w-5 text-white" />
              )}
            </div>
          </div>
          <span className="text-[16px] text-[#333333] leading-tight">
            By creating an account, I agree to our{' '}
            <Link href="/terms" className="text-[#111111] underline underline-offset-2">
              Terms of use
            </Link>{' '}
            and{' '}
            <Link href="/privacy" className="text-[#111111] underline underline-offset-2">
              Privacy Policy
            </Link>
          </span>
        </label>
      </div>

      {/* Google Sign Up Button */}
      <button
        onClick={handleGoogleSignup}
        disabled={loading || !selectedRole}
        className={`w-full flex items-center justify-center gap-2 py-4 px-6 rounded-[32px] text-[20px] font-normal transition-colors disabled:cursor-not-allowed ${
          selectedRole
            ? 'bg-[#07070a] text-white hover:bg-[#1a1a1f] disabled:opacity-50'
            : 'bg-[#07070a]/25 text-white cursor-not-allowed'
        }`}
      >
        <svg className="h-6 w-6" viewBox="0 0 24 24">
          <path
            fill="#fff"
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
          />
          <path
            fill="#fff"
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
          />
          <path
            fill="#fff"
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
          />
          <path
            fill="#fff"
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
          />
        </svg>
        {loading ? 'Signing up...' : 'Sign up'}
      </button>

      {/* Login Link */}
      <p className="mt-8 text-center text-[16px]">
        <span className="text-[#333333]">Already have an account?</span>{' '}
        <Link
          href="/login"
          className="text-[#111111] underline underline-offset-2 hover:text-black"
        >
          Log in
        </Link>
      </p>
    </AuthLayout>
  );
}
