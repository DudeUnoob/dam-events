'use client';

import { cn } from '@/lib/utils';

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
    <div className="flex items-center justify-center gap-0 overflow-x-auto py-4">
      {displayIndices.map((stepIndex, displayIndex) => {
        const step = steps[stepIndex];
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
                <div className="hidden sm:block w-16 md:w-24 lg:w-28 h-[1px] bg-black/30 mx-2" />
                <span className="text-black/40 text-sm mx-1">...</span>
                <div className="hidden sm:block w-16 md:w-24 lg:w-28 h-[1px] bg-black/30 mx-2" />
              </>
            )}

            {/* Connector line (before step, except first) */}
            {displayIndex > 0 && !hasGap && (
              <div className="hidden sm:block w-16 md:w-24 lg:w-28 h-[1px] bg-black/30 mx-2" />
            )}

            {/* Step button */}
            <button
              onClick={() => isClickable && onStepClick(stepIndex)}
              disabled={!isClickable}
              className={cn(
                'flex items-center justify-center transition-all px-2',
                isClickable && 'cursor-pointer hover:opacity-80'
              )}
            >
              {/* Step label */}
              <span
                className={cn(
                  'text-xl md:text-2xl lg:text-[32px] text-center whitespace-nowrap transition-all',
                  isCurrent
                    ? 'font-bold text-[#65a4d8]'
                    : 'font-light text-black'
                )}
                style={{
                  fontFamily: isCurrent ? "'Manrope', sans-serif" : "'Manrope', sans-serif",
                }}
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
