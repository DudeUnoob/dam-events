'use client';

import { forwardRef } from 'react';
import { cn } from '@/lib/utils';

interface TimeSelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
}

// Generate time options in 30-minute increments
function generateTimeOptions(): string[] {
  const times: string[] = [];
  const periods = ['AM', 'PM'];

  periods.forEach((period) => {
    const start = period === 'AM' ? 1 : 1;
    const end = period === 'AM' ? 12 : 12;

    for (let hour = start; hour <= end; hour++) {
      ['00', '30'].forEach((minute) => {
        const displayHour = hour === 12 && period === 'AM' ? 12 : hour;
        times.push(`${displayHour}:${minute} ${period}`);
      });
    }
  });

  return times;
}

export const TIME_OPTIONS = generateTimeOptions();

export const TimeSelect = forwardRef<HTMLSelectElement, TimeSelectProps>(
  ({ label, error, className, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="mb-1.5 block text-sm font-medium text-slate-700">
            {label}
          </label>
        )}
        <div className="relative">
          <select
            ref={ref}
            className={cn(
              'w-full appearance-none rounded-md border border-slate-300 bg-white px-4 py-2.5 pr-10 text-sm shadow-sm transition-colors',
              'hover:border-slate-400',
              'focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20',
              'disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-500',
              error && 'border-red-500 focus:border-red-500 focus:ring-red-500/20',
              className
            )}
            {...props}
          >
            <option value="">Select time</option>
            {TIME_OPTIONS.map((time) => (
              <option key={time} value={time}>
                {time}
              </option>
            ))}
          </select>

          {/* Chevron down icon */}
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
            <svg
              className="h-4 w-4 text-slate-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </div>
        </div>

        {error && <p className="mt-1.5 text-sm text-red-600">{error}</p>}
      </div>
    );
  }
);

TimeSelect.displayName = 'TimeSelect';
