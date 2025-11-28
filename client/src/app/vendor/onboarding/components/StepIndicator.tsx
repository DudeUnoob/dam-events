'use client';

import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';

interface StepInfo {
  id: string;
  title: string;
}

interface StepIndicatorProps {
  steps: StepInfo[];
  currentStepIndex: number;
  onStepClick?: (index: number) => void;
}

export function StepIndicator({
  steps,
  currentStepIndex,
  onStepClick,
}: StepIndicatorProps) {
  // For display, show condensed version if many steps
  const maxDisplaySteps = 5;
  const shouldCondense = steps.length > maxDisplaySteps;

  // Get display indices
  const getDisplaySteps = () => {
    if (!shouldCondense) return steps.map((_, i) => i);

    // Always show first, last, current, and surrounding steps
    const indices = new Set<number>();
    indices.add(0); // First step
    indices.add(steps.length - 1); // Last step
    indices.add(currentStepIndex); // Current step

    // Add one before and after current
    if (currentStepIndex > 0) indices.add(currentStepIndex - 1);
    if (currentStepIndex < steps.length - 1) indices.add(currentStepIndex + 1);

    return Array.from(indices).sort((a, b) => a - b);
  };

  const displayIndices = getDisplaySteps();

  return (
    <div className="flex items-center justify-center gap-2 overflow-x-auto">
      {displayIndices.map((stepIndex, displayIndex) => {
        const step = steps[stepIndex];
        const isCompleted = stepIndex < currentStepIndex;
        const isCurrent = stepIndex === currentStepIndex;
        const isClickable = stepIndex < currentStepIndex && onStepClick;

        // Check if there's a gap before this step
        const prevDisplayIndex = displayIndex > 0 ? displayIndices[displayIndex - 1] : -1;
        const hasGap = stepIndex - prevDisplayIndex > 1;

        return (
          <div key={step.id} className="flex items-center">
            {/* Gap indicator */}
            {hasGap && displayIndex > 0 && (
              <>
                <div className="hidden sm:block w-8 h-[2px] bg-slate-200 mx-1" />
                <span className="text-slate-400 text-sm mx-1">...</span>
                <div className="hidden sm:block w-8 h-[2px] bg-slate-200 mx-1" />
              </>
            )}

            {/* Connector line (before step, except first) */}
            {displayIndex > 0 && !hasGap && (
              <div
                className={cn(
                  'hidden sm:block w-12 md:w-16 lg:w-20 h-[2px] mx-1',
                  isCompleted || isCurrent ? 'bg-primary-400' : 'bg-slate-200'
                )}
              />
            )}

            {/* Step button */}
            <button
              onClick={() => isClickable && onStepClick(stepIndex)}
              disabled={!isClickable}
              className={cn(
                'flex flex-col items-center gap-1 min-w-[60px] transition-all',
                isClickable && 'cursor-pointer hover:scale-105'
              )}
            >
              {/* Step number/check */}
              <div
                className={cn(
                  'w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-all',
                  isCompleted && 'bg-primary-500 text-white',
                  isCurrent && 'bg-primary-500 text-white ring-4 ring-primary-100',
                  !isCompleted && !isCurrent && 'bg-slate-200 text-slate-500'
                )}
              >
                {isCompleted ? (
                  <Check className="w-4 h-4" />
                ) : (
                  stepIndex + 1
                )}
              </div>

              {/* Step label */}
              <span
                className={cn(
                  'text-xs font-medium text-center max-w-[80px] truncate',
                  isCurrent ? 'text-primary-600' : 'text-slate-500'
                )}
              >
                Step {stepIndex + 1}
              </span>
            </button>
          </div>
        );
      })}
    </div>
  );
}
