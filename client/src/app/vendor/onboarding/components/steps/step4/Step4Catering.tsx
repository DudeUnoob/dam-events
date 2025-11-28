'use client';

import { OnboardingStep4CateringData, FOOD_TYPES } from '@/types';
import { cn } from '@/lib/utils';

interface Step4CateringProps {
  data: OnboardingStep4CateringData;
  onChange: (data: Partial<OnboardingStep4CateringData>) => void;
}

export function Step4Catering({ data, onChange }: Step4CateringProps) {
  const toggleFoodType = (foodType: string) => {
    const current = data.foodTypes || [];
    const isSelected = current.includes(foodType);

    if (isSelected) {
      onChange({ foodTypes: current.filter((t) => t !== foodType) });
    } else {
      onChange({ foodTypes: [...current, foodType] });
    }
  };

  return (
    <div className="space-y-8">
      {/* Title */}
      <div className="text-center">
        <h1 className="text-4xl font-semibold text-slate-900 mb-4">
          What type of food do you cater?
        </h1>
        <p className="text-slate-600">
          Select all cuisine types and styles you offer
        </p>
      </div>

      {/* Food Type Grid */}
      <div className="max-w-4xl mx-auto">
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {FOOD_TYPES.map((foodType) => {
            const isSelected = (data.foodTypes || []).includes(foodType);

            return (
              <label
                key={foodType}
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
                  onChange={() => toggleFoodType(foodType)}
                  className="h-5 w-5 rounded border-slate-300 text-primary-600 focus:ring-primary-500"
                />
                <span
                  className={cn(
                    'text-sm font-medium',
                    isSelected ? 'text-primary-700' : 'text-slate-700'
                  )}
                >
                  {foodType}
                </span>
              </label>
            );
          })}
        </div>
      </div>

      {/* Selected count */}
      {(data.foodTypes?.length ?? 0) > 0 && (
        <p className="text-center text-sm text-slate-600">
          {data.foodTypes?.length} food type{data.foodTypes?.length !== 1 ? 's' : ''} selected
        </p>
      )}
    </div>
  );
}
