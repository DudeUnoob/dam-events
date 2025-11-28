'use client';

import { Button } from '@/components/ui/Button';
import { ArrowLeft, ArrowRight, Loader2, CheckCircle } from 'lucide-react';

interface NavigationButtonsProps {
  onBack: () => void;
  onNext: () => void;
  isFirstStep: boolean;
  isLastStep: boolean;
  isSubmitting: boolean;
}

export function NavigationButtons({
  onBack,
  onNext,
  isFirstStep,
  isLastStep,
  isSubmitting,
}: NavigationButtonsProps) {
  return (
    <div className="flex items-center justify-between">
      {/* Back Button */}
      <Button
        type="button"
        variant="outline"
        onClick={onBack}
        disabled={isFirstStep || isSubmitting}
        className={`
          px-6 py-3 rounded-full shadow-md
          ${isFirstStep ? 'invisible' : ''}
        `}
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back
      </Button>

      {/* Next/Complete Button */}
      <Button
        type="button"
        onClick={onNext}
        disabled={isSubmitting}
        className={`
          px-8 py-3 rounded-full shadow-md
          ${isLastStep
            ? 'bg-green-500 hover:bg-green-600 text-white'
            : 'bg-[#ebffd7] hover:bg-[#daf5c5] text-slate-800'
          }
        `}
      >
        {isSubmitting ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Completing...
          </>
        ) : isLastStep ? (
          <>
            <CheckCircle className="w-4 h-4 mr-2" />
            Complete
          </>
        ) : (
          <>
            Continue
            <ArrowRight className="w-4 h-4 ml-2" />
          </>
        )}
      </Button>
    </div>
  );
}
