'use client';

import { OnboardingStep4RentalsData, RENTAL_TYPES, DELIVERY_OPTIONS } from '@/types';
import { cn } from '@/lib/utils';

interface Step4RentalsProps {
  data: OnboardingStep4RentalsData;
  onChange: (data: Partial<OnboardingStep4RentalsData>) => void;
}

export function Step4Rentals({ data, onChange }: Step4RentalsProps) {
  const toggleRentalType = (rentalType: string) => {
    const current = data.rentalTypes || [];
    const isSelected = current.includes(rentalType);

    if (isSelected) {
      onChange({ rentalTypes: current.filter((t) => t !== rentalType) });
    } else {
      onChange({ rentalTypes: [...current, rentalType] });
    }
  };

  const toggleDeliveryOption = (option: string) => {
    const current = data.deliveryOptions || [];
    const isSelected = current.includes(option);

    if (isSelected) {
      onChange({ deliveryOptions: current.filter((t) => t !== option) });
    } else {
      onChange({ deliveryOptions: [...current, option] });
    }
  };

  return (
    <div className="space-y-8">
      {/* Title */}
      <div className="text-center">
        <h1 className="text-4xl font-semibold text-slate-900 mb-4">
          What type of rentals do you offer?
        </h1>
        <p className="text-slate-600">
          Select all rental items you provide
        </p>
      </div>

      {/* Rental Type Grid */}
      <div className="max-w-4xl mx-auto">
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {RENTAL_TYPES.map((rentalType) => {
            const isSelected = (data.rentalTypes || []).includes(rentalType);

            return (
              <label
                key={rentalType}
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
                  onChange={() => toggleRentalType(rentalType)}
                  className="h-5 w-5 rounded border-slate-300 text-primary-600 focus:ring-primary-500"
                />
                <span
                  className={cn(
                    'text-sm font-medium',
                    isSelected ? 'text-primary-700' : 'text-slate-700'
                  )}
                >
                  {rentalType}
                </span>
              </label>
            );
          })}
        </div>
      </div>

      {/* Delivery Options Section */}
      <div className="max-w-4xl mx-auto pt-6 border-t border-slate-200">
        <h2 className="text-xl font-semibold text-slate-900 mb-4 text-center">
          Do you offer setup or delivery services?
        </h2>

        <div className="flex flex-wrap justify-center gap-4">
          {DELIVERY_OPTIONS.map((option) => {
            const isSelected = (data.deliveryOptions || []).includes(option);

            return (
              <label
                key={option}
                className={cn(
                  'flex items-center gap-3 px-6 py-3 rounded-lg border-2 cursor-pointer transition-all',
                  isSelected
                    ? 'border-primary-500 bg-primary-50'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                )}
              >
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => toggleDeliveryOption(option)}
                  className="h-5 w-5 rounded border-slate-300 text-primary-600 focus:ring-primary-500"
                />
                <span
                  className={cn(
                    'text-sm font-medium',
                    isSelected ? 'text-primary-700' : 'text-slate-700'
                  )}
                >
                  {option}
                </span>
              </label>
            );
          })}
        </div>
      </div>

      {/* Selected count */}
      {(data.rentalTypes?.length ?? 0) > 0 && (
        <p className="text-center text-sm text-slate-600">
          {data.rentalTypes?.length} rental type{data.rentalTypes?.length !== 1 ? 's' : ''} selected
        </p>
      )}
    </div>
  );
}
