'use client';

import { BusinessLocationData } from '@/types';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';

interface BusinessLocationProps {
  data: BusinessLocationData;
  onChange: (data: BusinessLocationData) => void;
}

const US_STATES = [
  'Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California', 'Colorado', 'Connecticut',
  'Delaware', 'Florida', 'Georgia', 'Hawaii', 'Idaho', 'Illinois', 'Indiana', 'Iowa',
  'Kansas', 'Kentucky', 'Louisiana', 'Maine', 'Maryland', 'Massachusetts', 'Michigan',
  'Minnesota', 'Mississippi', 'Missouri', 'Montana', 'Nebraska', 'Nevada',
  'New Hampshire', 'New Jersey', 'New Mexico', 'New York', 'North Carolina',
  'North Dakota', 'Ohio', 'Oklahoma', 'Oregon', 'Pennsylvania', 'Rhode Island',
  'South Carolina', 'South Dakota', 'Tennessee', 'Texas', 'Utah', 'Vermont',
  'Virginia', 'Washington', 'West Virginia', 'Wisconsin', 'Wyoming',
];

const COUNTRIES = [
  'United States',
  'Canada',
  'Mexico',
  'United Kingdom',
  'Australia',
  'New Zealand',
  'Germany',
  'France',
  'Spain',
  'Italy',
  'Other',
];

export function BusinessLocation({ data, onChange }: BusinessLocationProps) {
  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-12">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-slate-900">Business Location</h1>
        <p className="mt-4 text-lg text-slate-600">
          Where is your business located?
        </p>
      </div>

      <div className="mt-12 rounded-2xl bg-gradient-to-br from-primary-50 to-slate-50 p-8 shadow-sm">
        <div className="space-y-5">
          <Input
            label="Street Address"
            type="text"
            value={data.street_address}
            onChange={(e) => onChange({ ...data, street_address: e.target.value })}
            placeholder="123 Main Street"
            required
          />

          <div className="grid grid-cols-2 gap-4">
            <Select
              label="State"
              value={data.state}
              onChange={(e) => onChange({ ...data, state: e.target.value })}
              required
            >
              <option value="">Select state</option>
              {US_STATES.map((state) => (
                <option key={state} value={state}>
                  {state}
                </option>
              ))}
            </Select>

            <Input
              label="Zip Code"
              type="text"
              value={data.zip_code}
              onChange={(e) => onChange({ ...data, zip_code: e.target.value })}
              placeholder="12345"
              maxLength={10}
              required
            />
          </div>

          <Input
            label="City"
            type="text"
            value={data.city}
            onChange={(e) => onChange({ ...data, city: e.target.value })}
            placeholder="Austin"
            required
          />

          <Select
            label="Country"
            value={data.country}
            onChange={(e) => onChange({ ...data, country: e.target.value })}
            required
          >
            <option value="">Select country</option>
            {COUNTRIES.map((country) => (
              <option key={country} value={country}>
                {country}
              </option>
            ))}
          </Select>
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
                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
            <p className="text-sm text-blue-900">
              This address will be used to help event planners find vendors in their area.
              Make sure it&apos;s accurate!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
