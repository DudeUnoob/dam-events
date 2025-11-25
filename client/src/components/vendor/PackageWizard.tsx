'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  WizardStep,
  PackageWizardData,
  ServiceSelectionData,
  AccountCreationData,
  BusinessLocationData,
  EventTypesData,
  VenueInformationData,
  DAYS_OF_WEEK,
} from '@/types';
import { ProgressIndicator } from '@/components/ui/ProgressIndicator';
import { Button } from '@/components/ui/Button';
import { ServiceSelection } from './steps/ServiceSelection';
import { AccountCreation } from './steps/AccountCreation';
import { BusinessLocation } from './steps/BusinessLocation';
import { EventTypes } from './steps/EventTypes';
import { VenueInformation } from './steps/VenueInformation';

const STEPS = [
  { number: 1, label: 'Step 1' },
  { number: 2, label: 'Step 2' },
  { number: 3, label: 'Step 3' },
  { number: 4, label: 'Step 4' },
  { number: 5, label: 'Step 5' },
];

const STORAGE_KEY = 'dam-events-wizard-data';

// Default/initial form data
function getInitialData(): PackageWizardData {
  return {
    step1: { services: [] },
    step2: { full_name: '', email: '', phone: '' },
    step3: {
      street_address: '',
      city: '',
      state: '',
      zip_code: '',
      country: 'United States',
    },
    step4: { event_types: [] },
    step5: {
      min_capacity: 0,
      max_capacity: 0,
      square_footage: undefined,
      short_description: '',
      hourly_rate_min: 0,
      hourly_rate_max: 0,
      amenities: [],
      availability: {
        monday: { isOpen: true, openTime: '9:00 AM', closeTime: '5:00 PM' },
        tuesday: { isOpen: true, openTime: '9:00 AM', closeTime: '5:00 PM' },
        wednesday: { isOpen: true, openTime: '9:00 AM', closeTime: '5:00 PM' },
        thursday: { isOpen: true, openTime: '9:00 AM', closeTime: '5:00 PM' },
        friday: { isOpen: true, openTime: '9:00 AM', closeTime: '5:00 PM' },
        saturday: { isOpen: false, openTime: '', closeTime: '' },
        sunday: { isOpen: false, openTime: '', closeTime: '' },
      },
      exception_dates: [],
      photos: [],
    },
  };
}

interface PackageWizardProps {
  isAuthenticated?: boolean;
  onComplete?: (data: PackageWizardData) => Promise<void>;
}

export function PackageWizard({
  isAuthenticated = false,
  onComplete,
}: PackageWizardProps) {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState<WizardStep>(1);
  const [completedSteps, setCompletedSteps] = useState<Set<WizardStep>>(new Set());
  const [formData, setFormData] = useState<PackageWizardData>(getInitialData());
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load saved data from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setFormData(parsed.formData || getInitialData());
        setCurrentStep(parsed.currentStep || 1);
        setCompletedSteps(new Set(parsed.completedSteps || []));
      } catch (error) {
        console.error('Failed to load saved wizard data:', error);
      }
    }
  }, []);

  // Save data to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        formData,
        currentStep,
        completedSteps: Array.from(completedSteps),
      })
    );
  }, [formData, currentStep, completedSteps]);

  const updateFormData = <K extends keyof PackageWizardData>(
    step: K,
    data: PackageWizardData[K]
  ) => {
    setFormData((prev) => ({
      ...prev,
      [step]: data,
    }));
  };

  const validateStep = (step: WizardStep): boolean => {
    switch (step) {
      case 1:
        return formData.step1.services.length > 0;
      case 2:
        if (isAuthenticated) return true;
        return !!(
          formData.step2.full_name.trim() &&
          formData.step2.email.trim() &&
          /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.step2.email)
        );
      case 3:
        return !!(
          formData.step3.street_address.trim() &&
          formData.step3.city.trim() &&
          formData.step3.state &&
          formData.step3.zip_code.trim() &&
          formData.step3.country
        );
      case 4:
        return formData.step4.event_types.length > 0;
      case 5:
        return !!(
          formData.step5.min_capacity > 0 &&
          formData.step5.max_capacity > 0 &&
          formData.step5.max_capacity >= formData.step5.min_capacity &&
          formData.step5.short_description.trim() &&
          formData.step5.hourly_rate_min > 0 &&
          formData.step5.hourly_rate_max > 0 &&
          formData.step5.hourly_rate_max >= formData.step5.hourly_rate_min &&
          formData.step5.amenities.length > 0
        );
      default:
        return false;
    }
  };

  const handleNext = () => {
    if (!validateStep(currentStep)) {
      alert('Please complete all required fields before continuing.');
      return;
    }

    setCompletedSteps((prev) => new Set(prev).add(currentStep));

    if (currentStep < 5) {
      setCurrentStep((prev) => (prev + 1) as WizardStep);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => (prev - 1) as WizardStep);
    }
  };

  const handleStepClick = (step: WizardStep) => {
    setCurrentStep(step);
  };

  const handleComplete = async () => {
    if (!validateStep(5)) {
      alert('Please complete all required fields before submitting.');
      return;
    }

    setIsSubmitting(true);

    try {
      if (onComplete) {
        await onComplete(formData);
      }

      // Clear saved data
      localStorage.removeItem(STORAGE_KEY);

      // Redirect to vendor dashboard or packages page
      router.push('/vendor/packages');
    } catch (error) {
      console.error('Error completing wizard:', error);
      alert('Failed to save your package. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Progress Indicator */}
      <ProgressIndicator
        currentStep={currentStep}
        steps={STEPS}
        onStepClick={handleStepClick}
        completedSteps={completedSteps}
      />

      {/* Step Content */}
      <div className="pb-24">
        {currentStep === 1 && (
          <ServiceSelection
            data={formData.step1}
            onChange={(data) => updateFormData('step1', data)}
          />
        )}

        {currentStep === 2 && (
          <AccountCreation
            data={formData.step2}
            onChange={(data) => updateFormData('step2', data)}
            isAuthenticated={isAuthenticated}
          />
        )}

        {currentStep === 3 && (
          <BusinessLocation
            data={formData.step3}
            onChange={(data) => updateFormData('step3', data)}
          />
        )}

        {currentStep === 4 && (
          <EventTypes
            data={formData.step4}
            onChange={(data) => updateFormData('step4', data)}
          />
        )}

        {currentStep === 5 && (
          <VenueInformation
            data={formData.step5}
            onChange={(data) => updateFormData('step5', data)}
          />
        )}
      </div>

      {/* Navigation Buttons */}
      <div className="fixed bottom-0 left-0 right-0 border-t border-slate-200 bg-white px-4 py-4 shadow-lg">
        <div className="mx-auto flex max-w-4xl items-center justify-between">
          <Button
            type="button"
            variant="outline"
            onClick={handleBack}
            disabled={currentStep === 1 || isSubmitting}
            size="lg"
            className="w-32"
          >
            Back
          </Button>

          {currentStep < 5 ? (
            <Button
              type="button"
              onClick={handleNext}
              disabled={isSubmitting}
              size="lg"
              className="w-32"
            >
              Continue
            </Button>
          ) : (
            <Button
              type="button"
              onClick={handleComplete}
              disabled={isSubmitting}
              size="lg"
              className="w-48 bg-green-600 hover:bg-green-700"
            >
              {isSubmitting ? 'Submitting...' : 'Complete'}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
