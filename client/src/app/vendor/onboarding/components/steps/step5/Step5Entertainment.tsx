'use client';

import { OnboardingStep5EntertainmentData, ENTERTAINMENT_EQUIPMENT, WeeklyAvailability } from '@/types';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { AvailabilitySchedule } from '@/components/vendor/AvailabilitySchedule';
import { cn } from '@/lib/utils';

interface Step5EntertainmentProps {
  data: OnboardingStep5EntertainmentData;
  onChange: (data: Partial<OnboardingStep5EntertainmentData>) => void;
}

export function Step5Entertainment({ data, onChange }: Step5EntertainmentProps) {
  const toggleEquipment = (equipment: string) => {
    const current = data.equipmentProvided || [];
    const isSelected = current.includes(equipment);

    if (isSelected) {
      onChange({ equipmentProvided: current.filter((e) => e !== equipment) });
    } else {
      onChange({ equipmentProvided: [...current, equipment] });
    }
  };

  return (
    <div className="space-y-8">
      {/* Title */}
      <div className="text-center">
        <h1 className="text-4xl font-semibold text-slate-900 mb-4">
          Entertainment Information
        </h1>
        <p className="text-slate-600">
          Provide details about your entertainment services
        </p>
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column */}
        <div className="space-y-6">
          {/* Performance Duration */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-3">
              Performance Duration (minutes)
            </label>
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Minimum Duration"
                type="number"
                placeholder="30"
                value={data.minPerformanceDuration || ''}
                onChange={(e) => onChange({ minPerformanceDuration: parseInt(e.target.value) || 0 })}
              />
              <Input
                label="Maximum Duration"
                type="number"
                placeholder="240"
                value={data.maxPerformanceDuration || ''}
                onChange={(e) => onChange({ maxPerformanceDuration: parseInt(e.target.value) || 0 })}
              />
            </div>
          </div>

          {/* Short Description */}
          <Textarea
            label="Short Description"
            placeholder="Describe your entertainment services..."
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
              Performance Photos
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

          {/* Equipment Provided */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-3">
              Equipment Provided
            </label>
            <div className="flex flex-wrap gap-2">
              {ENTERTAINMENT_EQUIPMENT.map((equipment) => {
                const isSelected = (data.equipmentProvided || []).includes(equipment);
                return (
                  <button
                    key={equipment}
                    type="button"
                    onClick={() => toggleEquipment(equipment)}
                    className={cn(
                      'px-3 py-1.5 rounded-full text-sm font-medium transition-all',
                      isSelected
                        ? 'bg-primary-100 text-primary-700 border-2 border-primary-300'
                        : 'bg-slate-100 text-slate-600 border-2 border-transparent hover:bg-slate-200'
                    )}
                  >
                    {equipment}
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
