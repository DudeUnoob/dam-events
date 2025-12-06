'use client';

import { OnboardingStep1Data, ServiceType } from '@/types';
import { cn } from '@/lib/utils';

interface Step1ServiceSelectionProps {
  data: OnboardingStep1Data;
  onChange: (data: Partial<OnboardingStep1Data>) => void;
}

// Custom icons matching Figma design
const CateringIcon = () => (
  <svg width="63" height="62" viewBox="0 0 63 62" fill="none">
    <ellipse cx="31.5" cy="49" rx="28" ry="8" fill="#f87171" />
    <path d="M31.5 10V20M31.5 20C25 20 15 25 15 40H48C48 25 38 20 31.5 20Z" stroke="#f87171" strokeWidth="3" strokeLinecap="round" />
    <circle cx="31.5" cy="8" r="3" fill="#f87171" />
    <path d="M20 15L25 20M43 15L38 20" stroke="#f87171" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

const VenueIcon = () => (
  <svg width="69" height="65" viewBox="0 0 69 65" fill="none">
    <rect x="10" y="20" width="49" height="40" rx="2" stroke="#6d9ec8" strokeWidth="3" />
    <rect x="18" y="30" width="10" height="10" rx="1" stroke="#6d9ec8" strokeWidth="2" />
    <rect x="41" y="30" width="10" height="10" rx="1" stroke="#6d9ec8" strokeWidth="2" />
    <rect x="18" y="45" width="10" height="10" rx="1" stroke="#6d9ec8" strokeWidth="2" />
    <rect x="41" y="45" width="10" height="10" rx="1" stroke="#6d9ec8" strokeWidth="2" />
    <path d="M34.5 5L10 20H59L34.5 5Z" stroke="#6d9ec8" strokeWidth="3" strokeLinejoin="round" />
  </svg>
);

const EntertainmentIcon = () => (
  <svg width="65" height="65" viewBox="0 0 65 65" fill="none">
    <circle cx="20" cy="45" r="12" stroke="#a78bfa" strokeWidth="3" />
    <circle cx="45" cy="45" r="12" stroke="#a78bfa" strokeWidth="3" />
    <path d="M32 45V12" stroke="#a78bfa" strokeWidth="3" strokeLinecap="round" />
    <path d="M32 12C32 12 32 8 40 8C48 8 50 15 50 15" stroke="#a78bfa" strokeWidth="3" strokeLinecap="round" />
    <circle cx="50" cy="18" r="5" fill="#a78bfa" />
  </svg>
);

const RentalsIcon = () => (
  <svg width="75" height="76" viewBox="0 0 75 76" fill="none">
    <ellipse cx="37.5" cy="20" rx="15" ry="5" stroke="#e0d072" strokeWidth="3" />
    <path d="M22.5 20V60" stroke="#e0d072" strokeWidth="3" strokeLinecap="round" />
    <path d="M52.5 20V60" stroke="#e0d072" strokeWidth="3" strokeLinecap="round" />
    <path d="M22.5 60H52.5" stroke="#e0d072" strokeWidth="3" strokeLinecap="round" />
    <path d="M15 68H30M45 68H60" stroke="#e0d072" strokeWidth="3" strokeLinecap="round" />
    <path d="M22.5 60L15 68M52.5 60L60 68" stroke="#e0d072" strokeWidth="3" strokeLinecap="round" />
  </svg>
);

const SERVICES: { id: ServiceType; label: string; icon: React.ReactNode }[] = [
  {
    id: 'catering',
    label: 'Catering',
    icon: <CateringIcon />,
  },
  {
    id: 'venue',
    label: 'Venue',
    icon: <VenueIcon />,
  },
  {
    id: 'entertainment',
    label: 'Entertainment',
    icon: <EntertainmentIcon />,
  },
  {
    id: 'rentals',
    label: 'Rentals',
    icon: <RentalsIcon />,
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
    <div className="relative min-h-[500px]">
      {/* Decorative gradient blurs */}
      <div
        className="absolute top-[50px] left-1/2 -translate-x-1/2 w-[800px] h-[180px] rounded-[150px] blur-sm opacity-50 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at center, rgba(221,233,243,0.5) 0%, rgba(221,233,243,0.3) 50%, rgba(221,233,243,0.05) 100%)',
        }}
      />
      <div
        className="absolute top-[200px] left-1/2 -translate-x-1/2 w-[900px] h-[250px] rounded-[150px] blur-sm opacity-40 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at center, rgba(210,211,239,0.35) 0%, rgba(210,211,239,0.2) 50%, rgba(210,211,239,0.1) 100%)',
        }}
      />

      <div className="relative z-10 space-y-12 pt-8">
        {/* Title */}
        <div className="text-center">
          <h1
            className="text-3xl md:text-4xl lg:text-[48px] font-semibold text-black mb-4"
            style={{ fontFamily: "'Poppins', sans-serif" }}
          >
            What service do you provide?
          </h1>
        </div>

        {/* Service Grid */}
        <div className="flex flex-wrap justify-center gap-8 md:gap-12 lg:gap-16 py-8">
          {SERVICES.map((service) => {
            const isSelected = data.services.includes(service.id);

            return (
              <button
                key={service.id}
                type="button"
                onClick={() => toggleService(service.id)}
                className="flex flex-col items-center gap-4 transition-all duration-200 hover:scale-105 group"
              >
                {/* Icon Circle */}
                <div
                  className={cn(
                    'w-[100px] h-[100px] md:w-[120px] md:h-[120px] lg:w-[127px] lg:h-[127px]',
                    'rounded-full flex items-center justify-center transition-all',
                    'bg-white shadow-[0px_4px_10px_0px_rgba(0,0,0,0.25)]',
                    isSelected && 'ring-4 ring-[#65a4d8]/30'
                  )}
                >
                  {service.icon}
                </div>

                {/* Label */}
                <span
                  className={cn(
                    'text-lg md:text-xl lg:text-[24px] font-normal text-center',
                    isSelected ? 'text-[#65a4d8]' : 'text-black'
                  )}
                  style={{ fontFamily: "'Urbanist', sans-serif" }}
                >
                  {service.label}
                </span>
              </button>
            );
          })}
        </div>

        {/* Selected count */}
        {data.services.length > 0 && (
          <p
            className="text-center text-sm text-slate-600"
            style={{ fontFamily: "'Inter', sans-serif" }}
          >
            {data.services.length} service{data.services.length !== 1 ? 's' : ''} selected
          </p>
        )}
      </div>
    </div>
  );
}
