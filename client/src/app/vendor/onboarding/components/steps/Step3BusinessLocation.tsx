'use client';

import { OnboardingStep3Data } from '@/types';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';

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

export function Step3BusinessLocation({ data, onChange }: Step3BusinessLocationProps) {
  return (
    <div className="space-y-8">
      {/* Title */}
      <div className="text-center">
        <h1 className="text-4xl font-semibold text-slate-900 mb-4">
          Business Location
        </h1>
        <p className="text-slate-600">
          Where is your business located?
        </p>
      </div>

      {/* Form */}
      <div className="max-w-xl mx-auto space-y-6">
        {/* Street Address */}
        <Input
          label="Street Address"
          placeholder="123 Main Street"
          value={data.streetAddress}
          onChange={(e) => onChange({ streetAddress: e.target.value })}
          className="bg-white"
        />

        {/* City */}
        <Input
          label="City"
          placeholder="Austin"
          value={data.city}
          onChange={(e) => onChange({ city: e.target.value })}
          className="bg-white"
        />

        {/* State and Zip Code Row */}
        <div className="grid grid-cols-2 gap-4">
          <Select
            label="State"
            value={data.state}
            onChange={(e) => onChange({ state: e.target.value })}
            className="bg-white"
          >
            {US_STATES.map((state) => (
              <option key={state.value} value={state.value}>
                {state.label}
              </option>
            ))}
          </Select>

          <Input
            label="Zip Code"
            placeholder="78701"
            value={data.zipCode}
            onChange={(e) => onChange({ zipCode: e.target.value })}
            className="bg-white"
          />
        </div>

        {/* Country */}
        <Select
          label="Country"
          value={data.country}
          onChange={(e) => onChange({ country: e.target.value })}
          className="bg-white"
        >
          {COUNTRIES.map((country) => (
            <option key={country.value} value={country.value}>
              {country.label}
            </option>
          ))}
        </Select>
      </div>
    </div>
  );
}
