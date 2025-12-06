'use client';

import { Loader2 } from 'lucide-react';

interface NavigationButtonsProps {
  onBack: () => void;
  onNext: () => void;
  isFirstStep: boolean;
  isLastStep: boolean;
  isSubmitting: boolean;
  onCreatePackage?: () => void;
  showCreatePackage?: boolean;
}

export function NavigationButtons({
  onBack,
  onNext,
  isFirstStep,
  isLastStep,
  isSubmitting,
  onCreatePackage,
  showCreatePackage = false,
}: NavigationButtonsProps) {
  return (
    <div className="flex items-center justify-between">
      {/* Left side: Back button + Create Package button */}
      <div className="flex items-center gap-4">
        {/* Back Button */}
        <button
          type="button"
          onClick={onBack}
          disabled={isFirstStep || isSubmitting}
          className={`
            w-[155px] h-[55px] rounded-[100px]
            bg-[#f2f4f8] shadow-[0px_4px_4px_0px_rgba(0,0,0,0.3)]
            text-[24px] text-black/65 font-normal
            transition-all hover:bg-[#e5e7eb] disabled:opacity-50
            ${isFirstStep ? 'invisible' : ''}
          `}
          style={{ fontFamily: "'Poppins', sans-serif" }}
        >
          Back
        </button>

        {/* Create Package Button (shown on Step 5) */}
        {showCreatePackage && onCreatePackage && (
          <button
            type="button"
            onClick={onCreatePackage}
            disabled={isSubmitting}
            className="
              h-[50px] px-6 rounded-[5px]
              bg-[rgba(221,233,243,0.5)] border border-black/15
              shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)]
              text-[20px] text-black font-normal
              transition-all hover:bg-[rgba(221,233,243,0.7)]
              flex items-center gap-2
            "
            style={{ fontFamily: "'Inter', sans-serif" }}
          >
            <svg
              className="w-6 h-6"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
            >
              <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
              <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
              <line x1="12" y1="22.08" x2="12" y2="12" />
            </svg>
            Create Package
          </button>
        )}
      </div>

      {/* Right side: Continue/Complete Button */}
      <button
        type="button"
        onClick={onNext}
        disabled={isSubmitting}
        className={`
          w-[196px] h-[55px] rounded-[100px]
          shadow-[0px_4px_4px_0px_rgba(0,0,0,0.3)]
          text-[24px] font-normal
          transition-all disabled:opacity-50
          ${isLastStep
            ? 'bg-[#ebffd7] hover:bg-[#daf5c5] text-black'
            : 'bg-[#ebffd7] hover:bg-[#daf5c5] text-black/65'
          }
        `}
        style={{ fontFamily: "'Poppins', sans-serif" }}
      >
        {isSubmitting ? (
          <span className="flex items-center justify-center gap-2">
            <Loader2 className="w-5 h-5 animate-spin" />
            ...
          </span>
        ) : isLastStep ? (
          'Complete'
        ) : (
          'Continue'
        )}
      </button>
    </div>
  );
}
