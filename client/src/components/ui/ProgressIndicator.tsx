'use client';

import { WizardStep } from '@/types';
import { cn } from '@/lib/utils';

interface ProgressIndicatorProps {
  currentStep: WizardStep;
  steps: Array<{
    number: number;
    label: string;
  }>;
  onStepClick?: (step: WizardStep) => void;
  completedSteps?: Set<WizardStep>;
}

export function ProgressIndicator({
  currentStep,
  steps,
  onStepClick,
  completedSteps = new Set(),
}: ProgressIndicatorProps) {
  return (
    <div className="w-full bg-white py-8">
      <div className="mx-auto max-w-4xl px-4">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => {
            const isCompleted = completedSteps.has(step.number as WizardStep);
            const isCurrent = currentStep === step.number;
            const isClickable = isCompleted && onStepClick;
            const showConnector = index < steps.length - 1;

            return (
              <div key={step.number} className="flex flex-1 items-center">
                {/* Step Circle */}
                <div className="flex flex-col items-center">
                  <button
                    onClick={() => isClickable && onStepClick(step.number as WizardStep)}
                    disabled={!isClickable}
                    className={cn(
                      'relative flex h-12 w-12 items-center justify-center rounded-full border-2 transition-all duration-200',
                      isCurrent &&
                        'border-primary-500 bg-primary-50 font-bold text-primary-600 shadow-lg',
                      !isCurrent &&
                        isCompleted &&
                        'border-primary-400 bg-primary-500 text-white hover:bg-primary-600',
                      !isCurrent &&
                        !isCompleted &&
                        'border-slate-300 bg-white text-slate-400',
                      isClickable && 'cursor-pointer hover:scale-105',
                      !isClickable && 'cursor-default'
                    )}
                  >
                    {isCompleted && !isCurrent ? (
                      <svg
                        className="h-6 w-6"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={3}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    ) : (
                      <span className="text-lg font-semibold">{step.number}</span>
                    )}
                  </button>
                  <span
                    className={cn(
                      'mt-2 text-center text-sm font-medium transition-colors',
                      isCurrent ? 'text-primary-600' : 'text-slate-600'
                    )}
                  >
                    {step.label}
                  </span>
                </div>

                {/* Connector Line */}
                {showConnector && (
                  <div className="mx-2 flex-1">
                    <div
                      className={cn(
                        'h-0.5 transition-colors duration-300',
                        isCompleted ? 'bg-primary-500' : 'bg-slate-300'
                      )}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
