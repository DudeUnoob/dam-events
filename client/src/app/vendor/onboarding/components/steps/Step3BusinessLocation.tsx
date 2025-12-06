'use client';

import { OnboardingStep3Data } from '@/types';
import { ChevronDown } from 'lucide-react';

interface Step3BusinessLocationProps {
  data: OnboardingStep3Data;
  onChange: (data: Partial<OnboardingStep3Data>) => void;
}

const US_STATES = [
  { value: '', label: 'Select State' },
  { value: 'AL', label: 'Alabama' },
  { value: 'AK', label: 'Alaska' },
  { value: 'AZ', label: 'Arizona' },
  { value: 'AR', label: 'Arkansas' },
  { value: 'CA', label: 'California' },
  { value: 'CO', label: 'Colorado' },
  { value: 'CT', label: 'Connecticut' },
  { value: 'DE', label: 'Delaware' },
  { value: 'FL', label: 'Florida' },
  { value: 'GA', label: 'Georgia' },
  { value: 'HI', label: 'Hawaii' },
  { value: 'ID', label: 'Idaho' },
  { value: 'IL', label: 'Illinois' },
  { value: 'IN', label: 'Indiana' },
  { value: 'IA', label: 'Iowa' },
  { value: 'KS', label: 'Kansas' },
  { value: 'KY', label: 'Kentucky' },
  { value: 'LA', label: 'Louisiana' },
  { value: 'ME', label: 'Maine' },
  { value: 'MD', label: 'Maryland' },
  { value: 'MA', label: 'Massachusetts' },
  { value: 'MI', label: 'Michigan' },
  { value: 'MN', label: 'Minnesota' },
  { value: 'MS', label: 'Mississippi' },
  { value: 'MO', label: 'Missouri' },
  { value: 'MT', label: 'Montana' },
  { value: 'NE', label: 'Nebraska' },
  { value: 'NV', label: 'Nevada' },
  { value: 'NH', label: 'New Hampshire' },
  { value: 'NJ', label: 'New Jersey' },
  { value: 'NM', label: 'New Mexico' },
  { value: 'NY', label: 'New York' },
  { value: 'NC', label: 'North Carolina' },
  { value: 'ND', label: 'North Dakota' },
  { value: 'OH', label: 'Ohio' },
  { value: 'OK', label: 'Oklahoma' },
  { value: 'OR', label: 'Oregon' },
  { value: 'PA', label: 'Pennsylvania' },
  { value: 'RI', label: 'Rhode Island' },
  { value: 'SC', label: 'South Carolina' },
  { value: 'SD', label: 'South Dakota' },
  { value: 'TN', label: 'Tennessee' },
  { value: 'TX', label: 'Texas' },
  { value: 'UT', label: 'Utah' },
  { value: 'VT', label: 'Vermont' },
  { value: 'VA', label: 'Virginia' },
  { value: 'WA', label: 'Washington' },
  { value: 'WV', label: 'West Virginia' },
  { value: 'WI', label: 'Wisconsin' },
  { value: 'WY', label: 'Wyoming' },
];

const COUNTRIES = [
  { value: 'United States', label: 'United States' },
  { value: 'Canada', label: 'Canada' },
  { value: 'Mexico', label: 'Mexico' },
];

// Custom styled input matching Figma design
function FigmaInput({
  placeholder,
  value,
  onChange,
}: {
  placeholder: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) {
  return (
    <input
      type="text"
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      className="
        w-full h-[67px] px-4
        bg-[#fdfdfd] border border-black rounded-[15px]
        shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)]
        text-[24px] text-black/65 placeholder:text-black/65
        focus:outline-none focus:ring-2 focus:ring-[#65a4d8]/50
      "
      style={{ fontFamily: "'Manrope', sans-serif" }}
    />
  );
}

// Custom styled select matching Figma design
function FigmaSelect({
  placeholder,
  value,
  onChange,
  options,
}: {
  placeholder: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={onChange}
        className="
          w-full h-[67px] px-4 pr-12 appearance-none
          bg-[#fdfdfd] border border-black rounded-[15px]
          shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)]
          text-[24px] text-black/65
          focus:outline-none focus:ring-2 focus:ring-[#65a4d8]/50
          cursor-pointer
        "
        style={{ fontFamily: "'Manrope', sans-serif" }}
      >
        <option value="" disabled>
          {placeholder}
        </option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-6 h-6 text-black/60 pointer-events-none" />
    </div>
  );
}

export function Step3BusinessLocation({ data, onChange }: Step3BusinessLocationProps) {
  return (
    <div className="relative min-h-[500px]">
      {/* Decorative gradient blurs */}
      <div
        className="absolute top-[150px] left-1/2 -translate-x-1/2 w-[911px] h-[413px] rounded-[50px] blur-sm opacity-30 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at 20% 30%, rgba(210,211,239,0.35) 0%, rgba(210,211,239,0.2) 50%, rgba(210,211,239,0.3) 100%)',
        }}
      />
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[250px] rounded-[150px] blur-sm opacity-40 pointer-events-none"
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
            Business Location
          </h1>
        </div>

        {/* Form */}
        <div className="max-w-[704px] mx-auto space-y-5">
          {/* Street Address */}
          <FigmaInput
            placeholder="Street Address"
            value={data.streetAddress}
            onChange={(e) => onChange({ streetAddress: e.target.value })}
          />

          {/* City */}
          <FigmaInput
            placeholder="City"
            value={data.city}
            onChange={(e) => onChange({ city: e.target.value })}
          />

          {/* State and Zip Code Row */}
          <div className="grid grid-cols-2 gap-4">
            <div className="relative">
              <input
                type="text"
                placeholder="State"
                value={data.state}
                onChange={(e) => onChange({ state: e.target.value })}
                list="states-list"
                className="
                  w-full h-[69px] px-4
                  bg-white border border-black rounded-[15px]
                  shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)]
                  text-[24px] text-black/65 placeholder:text-black/65
                  focus:outline-none focus:ring-2 focus:ring-[#65a4d8]/50
                "
                style={{ fontFamily: "'Manrope', sans-serif" }}
              />
              <datalist id="states-list">
                {US_STATES.filter(s => s.value).map((state) => (
                  <option key={state.value} value={state.value}>
                    {state.label}
                  </option>
                ))}
              </datalist>
            </div>

            <input
              type="text"
              placeholder="Zip Code"
              value={data.zipCode}
              onChange={(e) => onChange({ zipCode: e.target.value })}
              className="
                w-full h-[69px] px-4
                bg-white border border-black rounded-[15px]
                shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)]
                text-[24px] text-black/65 placeholder:text-black/65
                focus:outline-none focus:ring-2 focus:ring-[#65a4d8]/50
              "
              style={{ fontFamily: "'Manrope', sans-serif" }}
            />
          </div>

          {/* Country */}
          <FigmaSelect
            placeholder="Country"
            value={data.country}
            onChange={(e) => onChange({ country: e.target.value })}
            options={COUNTRIES}
          />
        </div>
      </div>
    </div>
  );
}
