'use client';

import { useState } from 'react';
import { AccountCreationData } from '@/types';
import { Input } from '@/components/ui/Input';

interface AccountCreationProps {
  data: AccountCreationData;
  onChange: (data: AccountCreationData) => void;
  isAuthenticated?: boolean;
}

export function AccountCreation({
  data,
  onChange,
  isAuthenticated = false,
}: AccountCreationProps) {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const handlePasswordChange = (value: string) => {
    setPassword(value);
    if (confirmPassword && value !== confirmPassword) {
      setPasswordError('Passwords do not match');
    } else {
      setPasswordError('');
    }
  };

  const handleConfirmPasswordChange = (value: string) => {
    setConfirmPassword(value);
    if (password && value !== password) {
      setPasswordError('Passwords do not match');
    } else {
      setPasswordError('');
    }
  };

  if (isAuthenticated) {
    return (
      <div className="mx-auto w-full max-w-2xl px-4 py-12">
        <div className="text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
            <svg
              className="h-8 w-8 text-green-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <h1 className="mt-6 text-4xl font-bold text-slate-900">
            Account Already Created
          </h1>
          <p className="mt-4 text-lg text-slate-600">
            You&apos;re logged in and ready to continue
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-12">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-slate-900">Create Your Account</h1>
        <p className="mt-4 text-lg text-slate-600">
          Set up your vendor profile to get started
        </p>
      </div>

      <div className="mt-12 rounded-2xl bg-gradient-to-br from-primary-50 to-slate-50 p-8 shadow-sm">
        <div className="space-y-5">
          <Input
            label="Full Name / Venue Name"
            type="text"
            value={data.full_name}
            onChange={(e) => onChange({ ...data, full_name: e.target.value })}
            placeholder="Enter your name or business name"
            required
          />

          <Input
            label="Email"
            type="email"
            value={data.email}
            onChange={(e) => onChange({ ...data, email: e.target.value })}
            placeholder="your@email.com"
            required
          />

          <Input
            label="Phone Number (Optional)"
            type="tel"
            value={data.phone || ''}
            onChange={(e) => onChange({ ...data, phone: e.target.value })}
            placeholder="+1 (555) 123-4567"
          />

          <Input
            label="Password"
            type="password"
            value={password}
            onChange={(e) => handlePasswordChange(e.target.value)}
            placeholder="Create a strong password"
            required
          />

          <Input
            label="Confirm Password"
            type="password"
            value={confirmPassword}
            onChange={(e) => handleConfirmPasswordChange(e.target.value)}
            placeholder="Re-enter your password"
            error={passwordError}
            required
          />
        </div>

        <div className="mt-6 rounded-lg bg-blue-50 p-4">
          <div className="flex gap-3">
            <svg
              className="h-5 w-5 flex-shrink-0 text-blue-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <p className="text-sm text-blue-900">
              Your password should be at least 8 characters long and include a mix of
              letters, numbers, and symbols.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
