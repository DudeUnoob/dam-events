'use client';

import { OnboardingStep1Data, ServiceType } from '@/types';
import { Building2, UtensilsCrossed, Music, Armchair } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Step1ServiceSelectionProps {
  data: OnboardingStep1Data;
  onChange: (data: Partial<OnboardingStep1Data>) => void;
}

const SERVICES: { id: ServiceType; label: string; icon: React.ReactNode; color: string }[] = [
  {
    id: 'catering',
    label: 'Catering',
    icon: <UtensilsCrossed className="w-12 h-12" />,
    color: 'text-red-400',
  },
  {
    id: 'venue',
    label: 'Venue',
    icon: <Building2 className="w-12 h-12" />,
    color: 'text-blue-400',
  },
  {
    id: 'entertainment',
    label: 'Entertainment',
    icon: <Music className="w-12 h-12" />,
    color: 'text-purple-400',
  },
  {
    id: 'rentals',
    label: 'Rentals',
    icon: <Armchair className="w-12 h-12" />,
    color: 'text-yellow-500',
  },
];

export function Step1ServiceSelection({ data, onChange }: Step1ServiceSelectionProps) {
  const toggleService = (serviceId: ServiceType) => {
    const currentServices = data.services;
    const isSelected = currentServices.includes(serviceId);

    if (isSelected) {
      onChange({ services: currentServices.filter((s) => s !== serviceId) });
    } else {
      onChange({ services: [...currentServices, serviceId] });
    }
  };

  return (
    <div className="space-y-8">
      {/* Title */}
      <div className="text-center">
        <h1 className="text-4xl font-semibold text-slate-900 mb-4">
          What service do you provide?
        </h1>
        <p className="text-slate-600">
          Select all services that your business offers. You can select multiple.
        </p>
      </div>

      {/* Service Grid */}
      <div className="flex flex-wrap justify-center gap-6 py-8">
        {SERVICES.map((service) => {
          const isSelected = data.services.includes(service.id);

          return (
            <button
              key={service.id}
              type="button"
              onClick={() => toggleService(service.id)}
              className={cn(
                'flex flex-col items-center gap-4 p-6 w-48 rounded-2xl transition-all duration-200',
                'border-2 hover:scale-105',
                isSelected
                  ? 'border-primary-500 bg-primary-50 shadow-lg shadow-primary-100'
                  : 'border-transparent bg-white shadow-md hover:shadow-lg'
              )}
            >
              {/* Icon Circle */}
              <div
                className={cn(
                  'w-28 h-28 rounded-full flex items-center justify-center transition-all',
                  'bg-white shadow-md',
                  isSelected && 'ring-4 ring-primary-200'
                )}
              >
                <div className={service.color}>{service.icon}</div>
              </div>

              {/* Label */}
              <span
                className={cn(
                  'text-base font-medium',
                  isSelected ? 'text-primary-700' : 'text-slate-700'
                )}
              >
                {service.label}
              </span>

              {/* Selection indicator */}
              {isSelected && (
                <div className="w-6 h-6 rounded-full bg-primary-500 flex items-center justify-center">
                  <svg
                    className="w-4 h-4 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Selected count */}
      {data.services.length > 0 && (
        <p className="text-center text-sm text-slate-600">
          {data.services.length} service{data.services.length !== 1 ? 's' : ''} selected
        </p>
      )}
    </div>
  );
}
