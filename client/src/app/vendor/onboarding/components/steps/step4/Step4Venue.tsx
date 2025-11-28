'use client';

import { OnboardingStep4VenueData, EVENT_TYPES } from '@/types';
import { cn } from '@/lib/utils';

interface Step4VenueProps {
  data: OnboardingStep4VenueData;
  onChange: (data: Partial<OnboardingStep4VenueData>) => void;
}

export function Step4Venue({ data, onChange }: Step4VenueProps) {
  const toggleEventType = (eventType: string) => {
    const current = data.eventTypes || [];
    const isSelected = current.includes(eventType);

    if (isSelected) {
      onChange({ eventTypes: current.filter((t) => t !== eventType) });
    } else {
      onChange({ eventTypes: [...current, eventType] });
    }
  };

  return (
    <div className="space-y-8">
      {/* Title */}
      <div className="text-center">
        <h1 className="text-4xl font-semibold text-slate-900 mb-4">
          What type of events do you host?
        </h1>
        <p className="text-slate-600">
          Select all event types that your venue can accommodate
        </p>
      </div>

      {/* Event Type Grid */}
      <div className="max-w-4xl mx-auto">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {EVENT_TYPES.map((eventType) => {
            const isSelected = (data.eventTypes || []).includes(eventType);

            return (
              <label
                key={eventType}
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
                  onChange={() => toggleEventType(eventType)}
                  className="h-5 w-5 rounded border-slate-300 text-primary-600 focus:ring-primary-500"
                />
                <span
                  className={cn(
                    'text-sm font-medium',
                    isSelected ? 'text-primary-700' : 'text-slate-700'
                  )}
                >
                  {eventType}
                </span>
              </label>
            );
          })}
        </div>
      </div>

      {/* Selected count */}
      {(data.eventTypes?.length ?? 0) > 0 && (
        <p className="text-center text-sm text-slate-600">
          {data.eventTypes?.length} event type{data.eventTypes?.length !== 1 ? 's' : ''} selected
        </p>
      )}
    </div>
  );
}
