'use client';

import { OnboardingStep4EntertainmentData, ENTERTAINMENT_TYPES } from '@/types';
import { cn } from '@/lib/utils';

interface Step4EntertainmentProps {
  data: OnboardingStep4EntertainmentData;
  onChange: (data: Partial<OnboardingStep4EntertainmentData>) => void;
}

export function Step4Entertainment({ data, onChange }: Step4EntertainmentProps) {
  const toggleEntertainmentType = (entertainmentType: string) => {
    const current = data.entertainmentTypes || [];
    const isSelected = current.includes(entertainmentType);

    if (isSelected) {
      onChange({ entertainmentTypes: current.filter((t) => t !== entertainmentType) });
    } else {
      onChange({ entertainmentTypes: [...current, entertainmentType] });
    }
  };

  return (
    <div className="space-y-8">
      {/* Title */}
      <div className="text-center">
        <h1 className="text-4xl font-semibold text-slate-900 mb-4">
          What type of entertainment do you offer?
        </h1>
        <p className="text-slate-600">
          Select all entertainment services you provide
        </p>
      </div>

      {/* Entertainment Type Grid */}
      <div className="max-w-4xl mx-auto">
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {ENTERTAINMENT_TYPES.map((entertainmentType) => {
            const isSelected = (data.entertainmentTypes || []).includes(entertainmentType);

            return (
              <label
                key={entertainmentType}
                className={cn(
                  'flex items-center gap-3 p-4 rounded-lg border-2 cursor-pointer transition-all',
                  isSelected
                    ? 'border-primary-500 bg-primary-50'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                )}
              >
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => toggleEntertainmentType(entertainmentType)}
                  className="h-5 w-5 rounded border-slate-300 text-primary-600 focus:ring-primary-500"
                />
                <span
                  className={cn(
                    'text-sm font-medium',
                    isSelected ? 'text-primary-700' : 'text-slate-700'
                  )}
                >
                  {entertainmentType}
                </span>
              </label>
            );
          })}
        </div>
      </div>

      {/* Selected count */}
      {(data.entertainmentTypes?.length ?? 0) > 0 && (
        <p className="text-center text-sm text-slate-600">
          {data.entertainmentTypes?.length} entertainment type{data.entertainmentTypes?.length !== 1 ? 's' : ''} selected
        </p>
      )}
    </div>
  );
}
