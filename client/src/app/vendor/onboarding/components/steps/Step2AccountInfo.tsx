'use client';

import { OnboardingStep2Data } from '@/types';
import { useAuth } from '@/contexts/AuthContext';

interface Step2AccountInfoProps {
  data: OnboardingStep2Data;
  onChange: (data: Partial<OnboardingStep2Data>) => void;
}

// Custom styled input matching Figma design
function FigmaInput({
  placeholder,
  value,
  onChange,
  type = 'text',
  readOnly = false,
}: {
  placeholder: string;
  value: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  type?: string;
  readOnly?: boolean;
}) {
  return (
    <input
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      readOnly={readOnly}
      className="
        w-full h-[60px] px-8
        bg-[#fdfdfd] border border-black/60 rounded-[15px]
        shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)]
        text-[24px] text-black/65 placeholder:text-black/65
        focus:outline-none focus:ring-2 focus:ring-[#65a4d8]/50
        disabled:bg-gray-100 disabled:cursor-not-allowed
      "
      style={{ fontFamily: "'Manrope', sans-serif" }}
    />
  );
}

export function Step2AccountInfo({ data, onChange }: Step2AccountInfoProps) {
  const { user } = useAuth();

  return (
    <div className="relative min-h-[500px]">
      {/* Decorative gradient blurs */}
      <div
        className="absolute top-[100px] left-1/2 -translate-x-1/2 w-[911px] h-[508px] rounded-[50px] blur-sm opacity-30 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at 20% 30%, rgba(210,211,239,0.35) 0%, rgba(210,211,239,0.2) 50%, rgba(210,211,239,0.3) 100%)',
        }}
      />
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[200px] rounded-[150px] blur-sm opacity-40 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at center, rgba(221,233,243,0.5) 0%, rgba(221,233,243,0.3) 50%, rgba(221,233,243,0.05) 100%)',
        }}
      />

      <div className="relative z-10 space-y-8 pt-8">
        {/* Title */}
        <div className="text-center">
          <h1
            className="text-3xl md:text-4xl lg:text-[48px] font-semibold text-black mb-4"
            style={{ fontFamily: "'Poppins', sans-serif" }}
          >
            Create Your Account
          </h1>
        </div>

        {/* Form */}
        <div className="max-w-[725px] mx-auto space-y-5">
          {/* Vendor Name */}
          <FigmaInput
            placeholder="Vendor Name"
            value={data.businessName}
            onChange={(e) => onChange({ businessName: e.target.value })}
          />

          {/* Email (from Google OAuth - read only) */}
          <FigmaInput
            placeholder="Email"
            value={user?.email || ''}
            readOnly
          />

          {/* Phone */}
          <FigmaInput
            placeholder="Phone Number"
            type="tel"
            value={data.phone}
            onChange={(e) => onChange({ phone: e.target.value })}
          />
        </div>
      </div>
    </div>
  );
}
