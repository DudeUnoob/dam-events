'use client';

import { OnboardingStep5CateringData, CATERING_SERVICES, WeeklyAvailability } from '@/types';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { AvailabilitySchedule } from '@/components/vendor/AvailabilitySchedule';
import { cn } from '@/lib/utils';

interface Step5CateringProps {
  data: OnboardingStep5CateringData;
  onChange: (data: Partial<OnboardingStep5CateringData>) => void;
}

export function Step5Catering({ data, onChange }: Step5CateringProps) {
  const toggleService = (service: string) => {
    const current = data.servicesOffered || [];
    const isSelected = current.includes(service);

    if (isSelected) {
      onChange({ servicesOffered: current.filter((s) => s !== service) });
    } else {
      onChange({ servicesOffered: [...current, service] });
    }
  };

  return (
    <div className="space-y-8">
      {/* Title */}
      <div className="text-center">
        <h1 className="text-4xl font-semibold text-slate-900 mb-4">
          Catering Information
        </h1>
        <p className="text-slate-600">
          Provide details about your catering services
        </p>
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column */}
        <div className="space-y-6">
          {/* Guest Count */}
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Minimum Guest Count"
              type="number"
              placeholder="10"
              value={data.minGuestCount || ''}
              onChange={(e) => onChange({ minGuestCount: parseInt(e.target.value) || 0 })}
            />
            <Input
              label="Maximum Guest Count"
              type="number"
              placeholder="500"
              value={data.maxGuestCount || ''}
              onChange={(e) => onChange({ maxGuestCount: parseInt(e.target.value) || 0 })}
            />
          </div>

          {/* Short Description */}
          <Textarea
            label="Short Description"
            placeholder="Describe your catering services..."
            value={data.shortDescription}
            onChange={(e) => onChange({ shortDescription: e.target.value })}
            rows={4}
          />

          {/* Price Per Person */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-3">
              Price Per Person $
            </label>
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Minimum Price"
                type="number"
                placeholder="25"
                value={data.pricePerPersonMin || ''}
                onChange={(e) => onChange({ pricePerPersonMin: parseFloat(e.target.value) || 0 })}
              />
              <Input
                label="Maximum Price"
                type="number"
                placeholder="150"
                value={data.pricePerPersonMax || ''}
                onChange={(e) => onChange({ pricePerPersonMax: parseFloat(e.target.value) || 0 })}
              />
            </div>
          </div>

          {/* Photo Upload Placeholder */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-3">
              Catering Photos
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

          {/* Services Offered */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-3">
              Services Offered
            </label>
            <div className="flex flex-wrap gap-2">
              {CATERING_SERVICES.map((service) => {
                const isSelected = (data.servicesOffered || []).includes(service);
                return (
                  <button
                    key={service}
                    type="button"
                    onClick={() => toggleService(service)}
                    className={cn(
                      'px-3 py-1.5 rounded-full text-sm font-medium transition-all',
                      isSelected
                        ? 'bg-primary-100 text-primary-700 border-2 border-primary-300'
                        : 'bg-slate-100 text-slate-600 border-2 border-transparent hover:bg-slate-200'
                    )}
                  >
                    {service}
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
