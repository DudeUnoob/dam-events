'use client';

import { ServiceSelectionData, SERVICE_TYPES } from '@/types';
import { cn } from '@/lib/utils';

interface ServiceSelectionProps {
  data: ServiceSelectionData;
  onChange: (data: ServiceSelectionData) => void;
}

export function ServiceSelection({ data, onChange }: ServiceSelectionProps) {
  const toggleService = (serviceId: string) => {
    const isSelected = data.services.includes(serviceId);
    if (isSelected) {
      onChange({ services: data.services.filter((s) => s !== serviceId) });
    } else {
      onChange({ services: [...data.services, serviceId] });
    }
  };

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-12">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-slate-900">
          What service do you provide?
        </h1>
        <p className="mt-4 text-lg text-slate-600">
          Select all services that your business offers
        </p>
      </div>

      <div className="mt-16 grid grid-cols-2 gap-6 md:grid-cols-4">
        {SERVICE_TYPES.map((service) => {
          const isSelected = data.services.includes(service.id);

          return (
            <button
              key={service.id}
              type="button"
              onClick={() => toggleService(service.id)}
              className={cn(
                'group relative flex flex-col items-center justify-center rounded-2xl border-2 p-8 transition-all duration-200',
                'hover:scale-105 hover:shadow-lg',
                isSelected
                  ? 'border-primary-500 bg-primary-50 shadow-md'
                  : 'border-slate-200 bg-white hover:border-primary-300'
              )}
            >
              {/* Icon Circle */}
              <div
                className={cn(
                  'flex h-24 w-24 items-center justify-center rounded-full transition-colors',
                  isSelected ? 'bg-primary-100' : 'bg-slate-100 group-hover:bg-primary-50'
                )}
              >
                <span className="text-5xl">{service.icon}</span>
              </div>

              {/* Label */}
              <p
                className={cn(
                  'mt-4 text-lg font-semibold transition-colors',
                  isSelected ? 'text-primary-700' : 'text-slate-700'
                )}
              >
                {service.label}
              </p>

              {/* Selected Indicator */}
              {isSelected && (
                <div className="absolute right-3 top-3">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary-500">
                    <svg
                      className="h-4 w-4 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={3}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>
                </div>
              )}
            </button>
          );
        })}
      </div>

      {data.services.length > 0 && (
        <div className="mt-8 text-center">
          <p className="text-sm text-slate-600">
            {data.services.length} service{data.services.length !== 1 ? 's' : ''} selected
          </p>
        </div>
      )}
    </div>
  );
}
