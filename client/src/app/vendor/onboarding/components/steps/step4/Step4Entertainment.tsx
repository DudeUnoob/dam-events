'use client';

import { OnboardingStep4EntertainmentData, ENTERTAINMENT_TYPES } from '@/types';
import { Check } from 'lucide-react';

interface Step4EntertainmentProps {
  data: OnboardingStep4EntertainmentData;
  onChange: (data: Partial<OnboardingStep4EntertainmentData>) => void;
}

// Figma-styled checkbox component
function FigmaCheckbox({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: () => void;
  label: string;
}) {
  return (
    <label className="flex items-center gap-3 cursor-pointer group">
      <div
        onClick={onChange}
        className={`
          w-[31px] h-[31px] rounded-[3px] flex items-center justify-center
          border-2 border-[#545f71] transition-all
          ${checked ? 'bg-[#545f71]' : 'bg-[#f2f4f8]'}
        `}
      >
        {checked && <Check className="w-5 h-5 text-white" strokeWidth={3} />}
      </div>
      <span
        className="text-lg md:text-xl lg:text-[22px] text-black"
        style={{ fontFamily: "'Manrope', sans-serif" }}
      >
        {label}
      </span>
    </label>
  );
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
    <div className="relative min-h-[600px]">
      {/* Decorative gradient blurs */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[250px] rounded-[150px] blur-sm opacity-40 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at center, rgba(221,233,243,0.5) 0%, rgba(221,233,243,0.3) 50%, rgba(221,233,243,0.05) 100%)',
        }}
      />
      <div
        className="absolute top-[200px] left-1/2 -translate-x-1/2 w-[954px] h-[423px] rounded-[50px] blur-sm opacity-30 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at 20% 30%, rgba(210,211,239,0.35) 0%, rgba(210,211,239,0.2) 50%, rgba(210,211,239,0.3) 100%)',
        }}
      />

      <div className="relative z-10 space-y-8 pt-8">
        {/* Title */}
        <div className="text-center">
          <h1
            className="text-3xl md:text-4xl lg:text-[48px] font-semibold text-black mb-4"
            style={{ fontFamily: "'Poppins', sans-serif" }}
          >
            What type of entertainment do you offer?
          </h1>
        </div>

        {/* Entertainment Type Grid - 3 columns */}
        <div className="max-w-4xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-x-16 gap-y-5">
            {ENTERTAINMENT_TYPES.map((entertainmentType) => {
              const isSelected = (data.entertainmentTypes || []).includes(entertainmentType);

              return (
                <FigmaCheckbox
                  key={entertainmentType}
                  checked={isSelected}
                  onChange={() => toggleEntertainmentType(entertainmentType)}
                  label={entertainmentType}
                />
              );
            })}
          </div>
        </div>

        {/* Selected count */}
        {(data.entertainmentTypes?.length ?? 0) > 0 && (
          <p
            className="text-center text-sm text-slate-600"
            style={{ fontFamily: "'Inter', sans-serif" }}
          >
            {data.entertainmentTypes?.length} entertainment type{data.entertainmentTypes?.length !== 1 ? 's' : ''} selected
          </p>
        )}
      </div>
    </div>
  );
}
