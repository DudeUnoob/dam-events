'use client';

import { OnboardingStep5VenueData, COMMON_AMENITIES, WeeklyAvailability } from '@/types';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { AvailabilitySchedule } from '@/components/vendor/AvailabilitySchedule';
import { cn } from '@/lib/utils';

interface Step5VenueProps {
  data: OnboardingStep5VenueData;
  onChange: (data: Partial<OnboardingStep5VenueData>) => void;
}

export function Step5Venue({ data, onChange }: Step5VenueProps) {
  const toggleAmenity = (amenity: string) => {
    const current = data.amenities || [];
    const isSelected = current.includes(amenity);

    if (isSelected) {
      onChange({ amenities: current.filter((a) => a !== amenity) });
    } else {
      onChange({ amenities: [...current, amenity] });
    }
  };

  return (
    <div className="space-y-8">
      {/* Title */}
      <div className="text-center">
        <h1 className="text-4xl font-semibold text-slate-900 mb-4">
          Venue Information
        </h1>
        <p className="text-slate-600">
          Provide details about your venue
        </p>
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column */}
        <div className="space-y-6">
          {/* Capacity */}
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Minimum Capacity"
              type="number"
              placeholder="50"
              value={data.minCapacity || ''}
              onChange={(e) => onChange({ minCapacity: parseInt(e.target.value) || 0 })}
            />
            <Input
              label="Maximum Capacity"
              type="number"
              placeholder="500"
              value={data.maxCapacity || ''}
              onChange={(e) => onChange({ maxCapacity: parseInt(e.target.value) || 0 })}
            />
          </div>

          {/* Square Footage */}
          <Input
            label="Square Footage"
            type="number"
            placeholder="5000"
            value={data.squareFootage || ''}
            onChange={(e) => onChange({ squareFootage: parseInt(e.target.value) || 0 })}
          />

          {/* Short Description */}
          <Textarea
            label="Short Description"
            placeholder="Describe your venue..."
            value={data.shortDescription}
            onChange={(e) => onChange({ shortDescription: e.target.value })}
            rows={4}
          />

          {/* Hourly Rate */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-3">
              Hourly Rate $
            </label>
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Minimum Hourly Rate"
                type="number"
                placeholder="100"
                value={data.hourlyRateMin || ''}
                onChange={(e) => onChange({ hourlyRateMin: parseFloat(e.target.value) || 0 })}
              />
              <Input
                label="Maximum Hourly Rate"
                type="number"
                placeholder="500"
                value={data.hourlyRateMax || ''}
                onChange={(e) => onChange({ hourlyRateMax: parseFloat(e.target.value) || 0 })}
              />
            </div>
          </div>

          {/* Photo Upload Placeholder */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-3">
              Venue Photos
            </label>
            <div className="border-2 border-dashed border-slate-300 rounded-lg p-8 text-center">
              <p className="text-slate-500">Upload Photos [PNG or JPEG]</p>
              <p className="text-xs text-slate-400 mt-1">Photo upload will be available after registration</p>
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Availability */}
          <AvailabilitySchedule
            availability={data.availability}
            onChange={(availability: WeeklyAvailability) => onChange({ availability })}
          />

          {/* Amenities */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-3">
              Amenities
            </label>
            <div className="flex flex-wrap gap-2">
              {COMMON_AMENITIES.map((amenity) => {
                const isSelected = (data.amenities || []).includes(amenity);
                return (
                  <button
                    key={amenity}
                    type="button"
                    onClick={() => toggleAmenity(amenity)}
                    className={cn(
                      'px-3 py-1.5 rounded-full text-sm font-medium transition-all',
                      isSelected
                        ? 'bg-primary-100 text-primary-700 border-2 border-primary-300'
                        : 'bg-slate-100 text-slate-600 border-2 border-transparent hover:bg-slate-200'
                    )}
                  >
                    {amenity}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
