'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/Toast';
import {
  OnboardingFormData,
  ServiceType,
  WeeklyAvailability,
} from '@/types';

// Step components
import { StepIndicator } from './StepIndicator';
import { NavigationButtons } from './NavigationButtons';
import { Step1ServiceSelection } from './steps/Step1ServiceSelection';
import { Step2AccountInfo } from './steps/Step2AccountInfo';
import { Step3BusinessLocation } from './steps/Step3BusinessLocation';
import { Step4Venue } from './steps/step4/Step4Venue';
import { Step4Catering } from './steps/step4/Step4Catering';
import { Step4Entertainment } from './steps/step4/Step4Entertainment';
import { Step4Rentals } from './steps/step4/Step4Rentals';
import { Step5Venue } from './steps/step5/Step5Venue';
import { Step5Catering } from './steps/step5/Step5Catering';
import { Step5Entertainment } from './steps/step5/Step5Entertainment';
import { Step5Rentals } from './steps/step5/Step5Rentals';

const STORAGE_KEY = 'dam-events-onboarding-data';

// Default availability schedule
const defaultAvailability: WeeklyAvailability = {
  monday: { isOpen: true, openTime: '9:00 AM', closeTime: '10:00 PM' },
  tuesday: { isOpen: true, openTime: '9:00 AM', closeTime: '10:00 PM' },
  wednesday: { isOpen: true, openTime: '9:00 AM', closeTime: '10:00 PM' },
  thursday: { isOpen: true, openTime: '9:00 AM', closeTime: '10:00 PM' },
  friday: { isOpen: true, openTime: '9:00 AM', closeTime: '10:00 PM' },
  saturday: { isOpen: true, openTime: '9:00 AM', closeTime: '10:00 PM' },
  sunday: { isOpen: true, openTime: '9:00 AM', closeTime: '10:00 PM' },
};

// Initial form data
const initialFormData: OnboardingFormData = {
  step1: { services: [] },
  step2: { businessName: '', phone: '' },
  step3: { streetAddress: '', city: '', state: '', zipCode: '', country: 'United States' },
};

interface StepInfo {
  id: string;
  service?: ServiceType;
  stepType: 'common' | 'step4' | 'step5';
  title: string;
}

export function OnboardingWizard() {
  const router = useRouter();
  const { user } = useAuth();
  const { showToast } = useToast();

  const [formData, setFormData] = useState<OnboardingFormData>(initialFormData);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load saved data from localStorage on mount
  useEffect(() => {
    const savedData = localStorage.getItem(STORAGE_KEY);
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        setFormData(parsed.formData || initialFormData);
        setCurrentStepIndex(parsed.currentStepIndex || 0);
      } catch (e) {
        console.error('Failed to parse saved onboarding data:', e);
      }
    }
    setIsLoaded(true);
  }, []);

  // Save data to localStorage whenever it changes
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        formData,
        currentStepIndex,
      }));
    }
  }, [formData, currentStepIndex, isLoaded]);

  // Build the dynamic step list based on selected services
  const buildStepList = useCallback((): StepInfo[] => {
    const steps: StepInfo[] = [
      { id: 'step1', stepType: 'common', title: 'Service Selection' },
      { id: 'step2', stepType: 'common', title: 'Business Info' },
      { id: 'step3', stepType: 'common', title: 'Location' },
    ];

    // Add service-specific steps for each selected service
    const selectedServices = formData.step1.services;
    selectedServices.forEach((service) => {
      const serviceLabel = service.charAt(0).toUpperCase() + service.slice(1);
      steps.push({
        id: `step4-${service}`,
        service,
        stepType: 'step4',
        title: `${serviceLabel} Types`,
      });
      steps.push({
        id: `step5-${service}`,
        service,
        stepType: 'step5',
        title: `${serviceLabel} Details`,
      });
    });

    return steps;
  }, [formData.step1.services]);

  const steps = buildStepList();
  const currentStep = steps[currentStepIndex];
  const totalSteps = steps.length;
  const isFirstStep = currentStepIndex === 0;
  const isLastStep = currentStepIndex === totalSteps - 1;

  // Update form data for a specific step
  const updateFormData = <K extends keyof OnboardingFormData>(
    key: K,
    data: Partial<OnboardingFormData[K]>
  ) => {
    setFormData((prev) => ({
      ...prev,
      [key]: { ...prev[key], ...data } as OnboardingFormData[K],
    }));
  };

  // Initialize service-specific data when services are selected
  const initializeServiceData = (services: ServiceType[]) => {
    const newFormData = { ...formData };

    services.forEach((service) => {
      // Initialize Step 4 data if not exists
      if (service === 'venue' && !newFormData.venueStep4) {
        newFormData.venueStep4 = { eventTypes: [] };
      }
      if (service === 'catering' && !newFormData.cateringStep4) {
        newFormData.cateringStep4 = { foodTypes: [] };
      }
      if (service === 'entertainment' && !newFormData.entertainmentStep4) {
        newFormData.entertainmentStep4 = { entertainmentTypes: [] };
      }
      if (service === 'rentals' && !newFormData.rentalsStep4) {
        newFormData.rentalsStep4 = { rentalTypes: [], deliveryOptions: [] };
      }

      // Initialize Step 5 data if not exists
      if (service === 'venue' && !newFormData.venueStep5) {
        newFormData.venueStep5 = {
          minCapacity: 0,
          maxCapacity: 0,
          shortDescription: '',
          hourlyRateMin: 0,
          hourlyRateMax: 0,
          amenities: [],
          availability: defaultAvailability,
          exceptionDates: [],
          photos: [],
        };
      }
      if (service === 'catering' && !newFormData.cateringStep5) {
        newFormData.cateringStep5 = {
          minGuestCount: 0,
          maxGuestCount: 0,
          shortDescription: '',
          pricePerPersonMin: 0,
          pricePerPersonMax: 0,
          servicesOffered: [],
          availability: defaultAvailability,
          exceptionDates: [],
          photos: [],
        };
      }
      if (service === 'entertainment' && !newFormData.entertainmentStep5) {
        newFormData.entertainmentStep5 = {
          minPerformanceDuration: 0,
          maxPerformanceDuration: 0,
          shortDescription: '',
          hourlyRateMin: 0,
          hourlyRateMax: 0,
          equipmentProvided: [],
          availability: defaultAvailability,
          exceptionDates: [],
          photos: [],
        };
      }
      if (service === 'rentals' && !newFormData.rentalsStep5) {
        newFormData.rentalsStep5 = {
          minOrderSize: 0,
          maxOrderSize: 0,
          shortDescription: '',
          itemizedPricing: [],
          servicesOffered: [],
          availability: defaultAvailability,
          exceptionDates: [],
          photos: [],
        };
      }
    });

    setFormData(newFormData);
  };

  // Validate current step
  const validateCurrentStep = (): boolean => {
    if (!currentStep) return false;

    if (currentStep.stepType === 'common') {
      if (currentStep.id === 'step1') {
        return formData.step1.services.length > 0;
      }
      if (currentStep.id === 'step2') {
        return formData.step2.businessName.trim().length > 0;
      }
      if (currentStep.id === 'step3') {
        return (
          formData.step3.streetAddress.trim().length > 0 &&
          formData.step3.city.trim().length > 0 &&
          formData.step3.state.trim().length > 0 &&
          formData.step3.zipCode.trim().length > 0
        );
      }
    }

    if (currentStep.stepType === 'step4' && currentStep.service) {
      const service = currentStep.service;
      if (service === 'venue') {
        return (formData.venueStep4?.eventTypes?.length ?? 0) > 0;
      }
      if (service === 'catering') {
        return (formData.cateringStep4?.foodTypes?.length ?? 0) > 0;
      }
      if (service === 'entertainment') {
        return (formData.entertainmentStep4?.entertainmentTypes?.length ?? 0) > 0;
      }
      if (service === 'rentals') {
        return (formData.rentalsStep4?.rentalTypes?.length ?? 0) > 0;
      }
    }

    if (currentStep.stepType === 'step5' && currentStep.service) {
      const service = currentStep.service;
      if (service === 'venue') {
        const data = formData.venueStep5;
        return !!(
          data &&
          data.maxCapacity > 0 &&
          data.shortDescription.trim().length > 0 &&
          data.hourlyRateMax > 0
        );
      }
      if (service === 'catering') {
        const data = formData.cateringStep5;
        return !!(
          data &&
          data.maxGuestCount > 0 &&
          data.shortDescription.trim().length > 0 &&
          data.pricePerPersonMax > 0
        );
      }
      if (service === 'entertainment') {
        const data = formData.entertainmentStep5;
        return !!(
          data &&
          data.maxPerformanceDuration > 0 &&
          data.shortDescription.trim().length > 0 &&
          data.hourlyRateMax > 0
        );
      }
      if (service === 'rentals') {
        const data = formData.rentalsStep5;
        return !!(data && data.shortDescription.trim().length > 0);
      }
    }

    return true;
  };

  // Handle navigation
  const handleNext = () => {
    if (!validateCurrentStep()) {
      showToast('Please complete all required fields', 'error');
      return;
    }

    // If leaving step 1, initialize service-specific data
    if (currentStep?.id === 'step1') {
      initializeServiceData(formData.step1.services);
    }

    if (isLastStep) {
      handleSubmit();
    } else {
      setCurrentStepIndex((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    if (!isFirstStep) {
      setCurrentStepIndex((prev) => prev - 1);
    }
  };

  // Handle form submission
  const handleSubmit = async () => {
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/vendors/onboarding', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok || data.error) {
        throw new Error(data.error?.message || 'Failed to complete onboarding');
      }

      // Clear saved data
      localStorage.removeItem(STORAGE_KEY);

      showToast('Profile created successfully!', 'success');
      router.push('/vendor/dashboard');
    } catch (err: any) {
      console.error('Error completing onboarding:', err);
      showToast(err.message || 'Failed to complete onboarding', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Render current step
  const renderStep = () => {
    if (!currentStep) return null;

    if (currentStep.stepType === 'common') {
      switch (currentStep.id) {
        case 'step1':
          return (
            <Step1ServiceSelection
              data={formData.step1}
              onChange={(data) => updateFormData('step1', data)}
            />
          );
        case 'step2':
          return (
            <Step2AccountInfo
              data={formData.step2}
              onChange={(data) => updateFormData('step2', data)}
            />
          );
        case 'step3':
          return (
            <Step3BusinessLocation
              data={formData.step3}
              onChange={(data) => updateFormData('step3', data)}
            />
          );
      }
    }

    if (currentStep.stepType === 'step4' && currentStep.service) {
      switch (currentStep.service) {
        case 'venue':
          return (
            <Step4Venue
              data={formData.venueStep4!}
              onChange={(data) => updateFormData('venueStep4', data)}
            />
          );
        case 'catering':
          return (
            <Step4Catering
              data={formData.cateringStep4!}
              onChange={(data) => updateFormData('cateringStep4', data)}
            />
          );
        case 'entertainment':
          return (
            <Step4Entertainment
              data={formData.entertainmentStep4!}
              onChange={(data) => updateFormData('entertainmentStep4', data)}
            />
          );
        case 'rentals':
          return (
            <Step4Rentals
              data={formData.rentalsStep4!}
              onChange={(data) => updateFormData('rentalsStep4', data)}
            />
          );
      }
    }

    if (currentStep.stepType === 'step5' && currentStep.service) {
      switch (currentStep.service) {
        case 'venue':
          return (
            <Step5Venue
              data={formData.venueStep5!}
              onChange={(data) => updateFormData('venueStep5', data)}
            />
          );
        case 'catering':
          return (
            <Step5Catering
              data={formData.cateringStep5!}
              onChange={(data) => updateFormData('cateringStep5', data)}
            />
          );
        case 'entertainment':
          return (
            <Step5Entertainment
              data={formData.entertainmentStep5!}
              onChange={(data) => updateFormData('entertainmentStep5', data)}
            />
          );
        case 'rentals':
          return (
            <Step5Rentals
              data={formData.rentalsStep5!}
              onChange={(data) => updateFormData('rentalsStep5', data)}
            />
          );
      }
    }

    return null;
  };

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-pulse text-slate-500">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30">
      {/* Step Indicator */}
      <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-sm border-b border-slate-200">
        <div className="max-w-5xl mx-auto px-4 py-6">
          <StepIndicator
            steps={steps}
            currentStepIndex={currentStepIndex}
            onStepClick={(index) => {
              // Only allow going back to completed steps
              if (index < currentStepIndex) {
                setCurrentStepIndex(index);
              }
            }}
          />
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-8">
          {renderStep()}
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="sticky bottom-0 bg-white/80 backdrop-blur-sm border-t border-slate-200">
        <div className="max-w-5xl mx-auto px-4 py-4">
          <NavigationButtons
            onBack={handleBack}
            onNext={handleNext}
            isFirstStep={isFirstStep}
            isLastStep={isLastStep}
            isSubmitting={isSubmitting}
          />
        </div>
      </div>
    </div>
  );
}
