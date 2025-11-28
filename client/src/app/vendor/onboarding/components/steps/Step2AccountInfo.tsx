'use client';

import { OnboardingStep2Data } from '@/types';
import { Input } from '@/components/ui/Input';
import { useAuth } from '@/contexts/AuthContext';

interface Step2AccountInfoProps {
  data: OnboardingStep2Data;
  onChange: (data: Partial<OnboardingStep2Data>) => void;
}

export function Step2AccountInfo({ data, onChange }: Step2AccountInfoProps) {
  const { user } = useAuth();

  return (
    <div className="space-y-8">
      {/* Title */}
      <div className="text-center">
        <h1 className="text-4xl font-semibold text-slate-900 mb-4">
          Create Your Account
        </h1>
        <p className="text-slate-600">
          Tell us about your business
        </p>
      </div>

      {/* Form */}
      <div className="max-w-xl mx-auto space-y-6">
        {/* Google Account Info (Read-only) */}
        {user && (
          <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
            <p className="text-sm text-slate-500 mb-1">Signed in as</p>
            <p className="font-medium text-slate-900">{user.email}</p>
            {user.full_name && (
              <p className="text-sm text-slate-600">{user.full_name}</p>
            )}
          </div>
        )}

        {/* Business Name */}
        <div>
          <Input
            label="Full Name / Business Name"
            placeholder="e.g., Elite Events Venue"
            value={data.businessName}
            onChange={(e) => onChange({ businessName: e.target.value })}
            className="bg-white"
          />
          <p className="mt-1 text-xs text-slate-500">
            This will be displayed to event planners
          </p>
        </div>

        {/* Phone */}
        <div>
          <Input
            label="Phone Number"
            type="tel"
            placeholder="(512) 555-0123"
            value={data.phone}
            onChange={(e) => onChange({ phone: e.target.value })}
            className="bg-white"
          />
          <p className="mt-1 text-xs text-slate-500">
            Used for lead notifications and planner communication
          </p>
        </div>
      </div>
    </div>
  );
}
