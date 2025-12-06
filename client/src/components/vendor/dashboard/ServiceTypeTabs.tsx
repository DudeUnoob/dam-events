'use client';

import { ServiceType } from '@/types';

const SERVICE_LABELS: Record<ServiceType, string> = {
  venue: 'Venue',
  catering: 'Catering',
  entertainment: 'Entertainment',
  rentals: 'Rentals',
};

const SERVICE_ICONS: Record<ServiceType, string> = {
  venue: '🏢',
  catering: '🍽️',
  entertainment: '🎵',
  rentals: '🪑',
};

interface ServiceTypeTabsProps {
  services: ServiceType[];
  activeService: ServiceType;
  onServiceChange: (service: ServiceType) => void;
}

export function ServiceTypeTabs({ services, activeService, onServiceChange }: ServiceTypeTabsProps) {
  // Only show tabs if vendor has multiple services
  if (services.length <= 1) {
    return null;
  }

  return (
    <div className="flex items-center gap-3 mb-6">
      <span className="text-sm font-medium text-slate-600">Filter by service:</span>
      <div className="flex items-center gap-2">
        {services.map((service) => {
          const isActive = service === activeService;
          return (
            <button
              key={service}
              onClick={() => onServiceChange(service)}
              className={`
                px-4 py-2 rounded-full text-sm font-medium transition-all
                ${isActive
                  ? 'bg-[#232834] text-white shadow-sm'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }
              `}
            >
              <span className="mr-1.5">{SERVICE_ICONS[service]}</span>
              {SERVICE_LABELS[service]}
            </button>
          );
        })}
      </div>
    </div>
  );
}
