'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { PhotoUpload } from '@/components/vendor/PhotoUpload';
import { AvailabilitySchedule } from '@/components/vendor/AvailabilitySchedule';
import { ArrowLeft, Package, Loader2, Building2, UtensilsCrossed, Music, Armchair } from 'lucide-react';
import Link from 'next/link';
import {
  ServiceType,
  WeeklyAvailability,
  COMMON_AMENITIES,
  EVENT_TYPES,
  FOOD_TYPES,
  ENTERTAINMENT_TYPES,
  ENTERTAINMENT_EQUIPMENT,
  RENTAL_TYPES,
  CATERING_SERVICES,
  RENTALS_SERVICES,
  ItemizedPricing,
} from '@/types';
import { cn } from '@/lib/utils';

// Default availability
const DEFAULT_AVAILABILITY: WeeklyAvailability = {
  monday: { isOpen: true, openTime: '9:00 AM', closeTime: '10:00 PM' },
  tuesday: { isOpen: true, openTime: '9:00 AM', closeTime: '10:00 PM' },
  wednesday: { isOpen: true, openTime: '9:00 AM', closeTime: '10:00 PM' },
  thursday: { isOpen: true, openTime: '9:00 AM', closeTime: '10:00 PM' },
  friday: { isOpen: true, openTime: '9:00 AM', closeTime: '11:00 PM' },
  saturday: { isOpen: true, openTime: '10:00 AM', closeTime: '11:00 PM' },
  sunday: { isOpen: true, openTime: '10:00 AM', closeTime: '8:00 PM' },
};

interface VendorProfile {
  id: string;
  services: ServiceType[];
  business_name: string;
  event_types?: string[];
}

interface PackageFormData {
  // Basic info
  name: string;
  description: string;
  serviceType: ServiceType | '';

  // Venue fields
  venueMinCapacity: number;
  venueMaxCapacity: number;
  venueSquareFootage: number;
  venueHourlyRateMin: number;
  venueHourlyRateMax: number;
  venueAmenities: string[];
  venueEventTypes: string[];
  venueAvailability: WeeklyAvailability;

  // Catering fields
  cateringMinGuests: number;
  cateringMaxGuests: number;
  cateringPricePerPersonMin: number;
  cateringPricePerPersonMax: number;
  cateringFoodTypes: string[];
  cateringServices: string[];
  cateringAvailability: WeeklyAvailability;

  // Entertainment fields
  entertainmentMinDuration: number;
  entertainmentMaxDuration: number;
  entertainmentHourlyRateMin: number;
  entertainmentHourlyRateMax: number;
  entertainmentTypes: string[];
  entertainmentEquipment: string[];
  entertainmentAvailability: WeeklyAvailability;

  // Rentals fields
  rentalsMinOrderSize: number;
  rentalsMaxOrderSize: number;
  rentalTypes: string[];
  rentalItemizedPricing: ItemizedPricing[];
  rentalServices: string[];
  rentalsAvailability: WeeklyAvailability;

  // Common
  photos: string[];
  status: 'draft' | 'published';
}

const SERVICE_ICONS = {
  venue: Building2,
  catering: UtensilsCrossed,
  entertainment: Music,
  rentals: Armchair,
};

const SERVICE_LABELS = {
  venue: 'Venue',
  catering: 'Catering',
  entertainment: 'Entertainment',
  rentals: 'Rentals',
};

export default function CreatePackagePage() {
  const router = useRouter();
  useAuth(); // Ensures user is authenticated
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [vendorProfile, setVendorProfile] = useState<VendorProfile | null>(null);

  const [formData, setFormData] = useState<PackageFormData>({
    name: '',
    description: '',
    serviceType: '',

    venueMinCapacity: 0,
    venueMaxCapacity: 0,
    venueSquareFootage: 0,
    venueHourlyRateMin: 0,
    venueHourlyRateMax: 0,
    venueAmenities: [],
    venueEventTypes: [],
    venueAvailability: DEFAULT_AVAILABILITY,

    cateringMinGuests: 0,
    cateringMaxGuests: 0,
    cateringPricePerPersonMin: 0,
    cateringPricePerPersonMax: 0,
    cateringFoodTypes: [],
    cateringServices: [],
    cateringAvailability: DEFAULT_AVAILABILITY,

    entertainmentMinDuration: 0,
    entertainmentMaxDuration: 0,
    entertainmentHourlyRateMin: 0,
    entertainmentHourlyRateMax: 0,
    entertainmentTypes: [],
    entertainmentEquipment: [],
    entertainmentAvailability: DEFAULT_AVAILABILITY,

    rentalsMinOrderSize: 0,
    rentalsMaxOrderSize: 0,
    rentalTypes: [],
    rentalItemizedPricing: [],
    rentalServices: [],
    rentalsAvailability: DEFAULT_AVAILABILITY,

    photos: [],
    status: 'published',
  });

  // Fetch vendor profile on mount
  useEffect(() => {
    const fetchVendorProfile = async () => {
      try {
        const response = await fetch('/api/vendors');
        const data = await response.json();

        if (data.data) {
          setVendorProfile(data.data);
          // If vendor only has one service, pre-select it
          if (data.data.services.length === 1) {
            setFormData(prev => ({ ...prev, serviceType: data.data.services[0] }));
          }
        } else {
          setError('Please complete your vendor profile before creating packages');
        }
      } catch (err) {
        console.error('Error fetching vendor profile:', err);
        setError('Failed to load vendor profile');
      } finally {
        setInitialLoading(false);
      }
    };

    fetchVendorProfile();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: parseFloat(value) || 0,
    }));
  };

  const toggleArrayItem = (field: keyof PackageFormData, value: string) => {
    setFormData((prev) => {
      const currentArray = prev[field] as string[];
      const isSelected = currentArray.includes(value);
      return {
        ...prev,
        [field]: isSelected
          ? currentArray.filter((item) => item !== value)
          : [...currentArray, value],
      };
    });
  };

  const handlePhotosUploaded = (urls: string[]) => {
    setFormData((prev) => ({
      ...prev,
      photos: urls,
    }));
  };

  const updateRentalPricing = (index: number, field: keyof ItemizedPricing, value: string | number) => {
    setFormData((prev) => {
      const updated = [...prev.rentalItemizedPricing];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, rentalItemizedPricing: updated };
    });
  };

  const addRentalPricingItem = () => {
    setFormData((prev) => ({
      ...prev,
      rentalItemizedPricing: [...prev.rentalItemizedPricing, { itemType: '', pricePerItem: 0, maxQuantity: 0 }],
    }));
  };

  const removeRentalPricingItem = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      rentalItemizedPricing: prev.rentalItemizedPricing.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>, status: 'draft' | 'published') => {
    e.preventDefault();

    if (!formData.serviceType) {
      setError('Please select a service type');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      if (!vendorProfile) {
        throw new Error('Vendor profile not found');
      }

      // Build package data based on selected service type
      let packageData: Record<string, unknown> = {
        vendorId: vendorProfile.id,
        name: formData.name,
        description: formData.description,
        status,
      };

      switch (formData.serviceType) {
        case 'venue':
          packageData = {
            ...packageData,
            priceMin: formData.venueHourlyRateMin,
            priceMax: formData.venueHourlyRateMax,
            capacity: formData.venueMaxCapacity,
            venueDetails: {
              name: formData.name,
              min_capacity: formData.venueMinCapacity,
              max_capacity: formData.venueMaxCapacity,
              square_footage: formData.venueSquareFootage,
              amenities: formData.venueAmenities,
              availability: formData.venueAvailability,
            },
          };
          break;

        case 'catering':
          packageData = {
            ...packageData,
            priceMin: formData.cateringPricePerPersonMin * formData.cateringMinGuests,
            priceMax: formData.cateringPricePerPersonMax * formData.cateringMaxGuests,
            capacity: formData.cateringMaxGuests,
            cateringDetails: {
              menu_options: formData.cateringFoodTypes,
              dietary_accommodations: [],
              services_offered: formData.cateringServices,
              min_guest_count: formData.cateringMinGuests,
              max_guest_count: formData.cateringMaxGuests,
              price_per_person_min: formData.cateringPricePerPersonMin,
              price_per_person_max: formData.cateringPricePerPersonMax,
              availability: formData.cateringAvailability,
            },
          };
          break;

        case 'entertainment':
          packageData = {
            ...packageData,
            priceMin: formData.entertainmentHourlyRateMin,
            priceMax: formData.entertainmentHourlyRateMax,
            capacity: 0,
            entertainmentDetails: {
              type: formData.entertainmentTypes[0] || 'General',
              equipment: formData.entertainmentEquipment,
              min_duration: formData.entertainmentMinDuration,
              max_duration: formData.entertainmentMaxDuration,
              availability: formData.entertainmentAvailability,
            },
          };
          break;

        case 'rentals':
          const prices = formData.rentalItemizedPricing.map(item => item.pricePerItem);
          const minPrice = prices.length > 0 ? Math.min(...prices) * formData.rentalsMinOrderSize : 0;
          const maxPrice = prices.length > 0 ? Math.max(...prices) * formData.rentalsMaxOrderSize : 0;
          packageData = {
            ...packageData,
            priceMin: minPrice,
            priceMax: maxPrice,
            capacity: formData.rentalsMaxOrderSize,
            entertainmentDetails: {
              type: 'rentals',
              rental_types: formData.rentalTypes,
              min_order_size: formData.rentalsMinOrderSize,
              max_order_size: formData.rentalsMaxOrderSize,
              itemized_pricing: formData.rentalItemizedPricing,
              services_offered: formData.rentalServices,
              availability: formData.rentalsAvailability,
              equipment: [],
            },
          };
          break;
      }

      const response = await fetch('/api/packages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(packageData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error?.message || 'Failed to create package');
      }

      router.push('/vendor/dashboard');
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create package. Please try again.';
      console.error('Error creating package:', err);
      setError(errorMessage);
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
      </div>
    );
  }

  if (!vendorProfile) {
    return (
      <div className="min-h-screen bg-slate-50">
        <div className="mx-auto max-w-4xl px-4 py-8">
          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-slate-600 mb-4">Please complete your vendor profile before creating packages.</p>
              <Button asChild>
                <Link href="/vendor/onboarding">Complete Onboarding</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Back Button */}
        <Button variant="ghost" size="sm" className="mb-6" asChild>
          <Link href="/vendor/dashboard">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Link>
        </Button>

        <Card variant="elevated">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-primary-100 p-3">
                <Package className="h-6 w-6 text-primary-600" />
              </div>
              <div>
                <CardTitle>Create New Package</CardTitle>
                <CardDescription>
                  Create a package for one of your services
                </CardDescription>
              </div>
            </div>
          </CardHeader>

          <CardContent>
            {error && (
              <div className="mb-6 rounded-lg bg-red-50 border border-red-200 p-4 text-sm text-red-800">
                {error}
              </div>
            )}

            <form onSubmit={(e) => handleSubmit(e, 'published')} className="space-y-8">
              {/* Service Type Selection */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-slate-900">Select Service Type</h3>
                <p className="text-sm text-slate-600">
                  Choose which of your services this package is for
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {vendorProfile.services.map((service) => {
                    const Icon = SERVICE_ICONS[service];
                    const isSelected = formData.serviceType === service;
                    return (
                      <button
                        key={service}
                        type="button"
                        onClick={() => setFormData((prev) => ({ ...prev, serviceType: service }))}
                        className={cn(
                          'flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-all',
                          isSelected
                            ? 'border-primary-500 bg-primary-50 text-primary-700'
                            : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                        )}
                      >
                        <Icon className="h-6 w-6" />
                        <span className="text-sm font-medium">{SERVICE_LABELS[service]}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Basic Information */}
              {formData.serviceType && (
                <>
                  <div className="space-y-6 border-t border-slate-200 pt-6">
                    <h3 className="text-lg font-semibold text-slate-900">Basic Information</h3>

                    <Input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      label="Package Name"
                      placeholder={`e.g., ${vendorProfile.business_name} - ${SERVICE_LABELS[formData.serviceType]} Package`}
                      required
                    />

                    <Textarea
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      label="Package Description"
                      placeholder="Describe what makes this package special..."
                      rows={4}
                      required
                    />
                  </div>

                  {/* Venue-specific fields */}
                  {formData.serviceType === 'venue' && (
                    <div className="space-y-6 border-t border-slate-200 pt-6">
                      <h3 className="text-lg font-semibold text-slate-900">Venue Details</h3>

                      <div className="grid gap-4 sm:grid-cols-2">
                        <Input
                          type="number"
                          name="venueMinCapacity"
                          value={formData.venueMinCapacity || ''}
                          onChange={handleNumberChange}
                          label="Minimum Capacity"
                          placeholder="50"
                          min="1"
                        />
                        <Input
                          type="number"
                          name="venueMaxCapacity"
                          value={formData.venueMaxCapacity || ''}
                          onChange={handleNumberChange}
                          label="Maximum Capacity"
                          placeholder="300"
                          min="1"
                          required
                        />
                      </div>

                      <Input
                        type="number"
                        name="venueSquareFootage"
                        value={formData.venueSquareFootage || ''}
                        onChange={handleNumberChange}
                        label="Square Footage (optional)"
                        placeholder="5000"
                        min="0"
                      />

                      <div className="grid gap-4 sm:grid-cols-2">
                        <Input
                          type="number"
                          name="venueHourlyRateMin"
                          value={formData.venueHourlyRateMin || ''}
                          onChange={handleNumberChange}
                          label="Minimum Hourly Rate ($)"
                          placeholder="100"
                          min="0"
                          required
                        />
                        <Input
                          type="number"
                          name="venueHourlyRateMax"
                          value={formData.venueHourlyRateMax || ''}
                          onChange={handleNumberChange}
                          label="Maximum Hourly Rate ($)"
                          placeholder="500"
                          min="0"
                          required
                        />
                      </div>

                      <div>
                        <label className="mb-3 block text-sm font-medium text-slate-700">Amenities</label>
                        <div className="flex flex-wrap gap-2">
                          {COMMON_AMENITIES.map((amenity) => {
                            const isSelected = formData.venueAmenities.includes(amenity);
                            return (
                              <button
                                key={amenity}
                                type="button"
                                onClick={() => toggleArrayItem('venueAmenities', amenity)}
                                className={cn(
                                  'px-3 py-1.5 rounded-full text-sm font-medium transition-all',
                                  isSelected
                                    ? 'bg-primary-100 text-primary-700 border-2 border-primary-300'
                                    : 'bg-slate-100 text-slate-600 border-2 border-transparent hover:bg-slate-200'
                                )}
                              >
                                {amenity}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      <div>
                        <label className="mb-3 block text-sm font-medium text-slate-700">Event Types</label>
                        <div className="flex flex-wrap gap-2">
                          {EVENT_TYPES.map((eventType) => {
                            const isSelected = formData.venueEventTypes.includes(eventType);
                            return (
                              <button
                                key={eventType}
                                type="button"
                                onClick={() => toggleArrayItem('venueEventTypes', eventType)}
                                className={cn(
                                  'px-3 py-1.5 rounded-full text-sm font-medium transition-all',
                                  isSelected
                                    ? 'bg-primary-100 text-primary-700 border-2 border-primary-300'
                                    : 'bg-slate-100 text-slate-600 border-2 border-transparent hover:bg-slate-200'
                                )}
                              >
                                {eventType}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      <AvailabilitySchedule
                        availability={formData.venueAvailability}
                        onChange={(availability) => setFormData((prev) => ({ ...prev, venueAvailability: availability }))}
                      />
                    </div>
                  )}

                  {/* Catering-specific fields */}
                  {formData.serviceType === 'catering' && (
                    <div className="space-y-6 border-t border-slate-200 pt-6">
                      <h3 className="text-lg font-semibold text-slate-900">Catering Details</h3>

                      <div className="grid gap-4 sm:grid-cols-2">
                        <Input
                          type="number"
                          name="cateringMinGuests"
                          value={formData.cateringMinGuests || ''}
                          onChange={handleNumberChange}
                          label="Minimum Guest Count"
                          placeholder="10"
                          min="1"
                          required
                        />
                        <Input
                          type="number"
                          name="cateringMaxGuests"
                          value={formData.cateringMaxGuests || ''}
                          onChange={handleNumberChange}
                          label="Maximum Guest Count"
                          placeholder="500"
                          min="1"
                          required
                        />
                      </div>

                      <div className="grid gap-4 sm:grid-cols-2">
                        <Input
                          type="number"
                          name="cateringPricePerPersonMin"
                          value={formData.cateringPricePerPersonMin || ''}
                          onChange={handleNumberChange}
                          label="Minimum Price Per Person ($)"
                          placeholder="25"
                          min="0"
                          required
                        />
                        <Input
                          type="number"
                          name="cateringPricePerPersonMax"
                          value={formData.cateringPricePerPersonMax || ''}
                          onChange={handleNumberChange}
                          label="Maximum Price Per Person ($)"
                          placeholder="150"
                          min="0"
                          required
                        />
                      </div>

                      <div>
                        <label className="mb-3 block text-sm font-medium text-slate-700">Food Types</label>
                        <div className="flex flex-wrap gap-2">
                          {FOOD_TYPES.map((foodType) => {
                            const isSelected = formData.cateringFoodTypes.includes(foodType);
                            return (
                              <button
                                key={foodType}
                                type="button"
                                onClick={() => toggleArrayItem('cateringFoodTypes', foodType)}
                                className={cn(
                                  'px-3 py-1.5 rounded-full text-sm font-medium transition-all',
                                  isSelected
                                    ? 'bg-primary-100 text-primary-700 border-2 border-primary-300'
                                    : 'bg-slate-100 text-slate-600 border-2 border-transparent hover:bg-slate-200'
                                )}
                              >
                                {foodType}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      <div>
                        <label className="mb-3 block text-sm font-medium text-slate-700">Services Offered</label>
                        <div className="flex flex-wrap gap-2">
                          {CATERING_SERVICES.map((service) => {
                            const isSelected = formData.cateringServices.includes(service);
                            return (
                              <button
                                key={service}
                                type="button"
                                onClick={() => toggleArrayItem('cateringServices', service)}
                                className={cn(
                                  'px-3 py-1.5 rounded-full text-sm font-medium transition-all',
                                  isSelected
                                    ? 'bg-primary-100 text-primary-700 border-2 border-primary-300'
                                    : 'bg-slate-100 text-slate-600 border-2 border-transparent hover:bg-slate-200'
                                )}
                              >
                                {service}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      <AvailabilitySchedule
                        availability={formData.cateringAvailability}
                        onChange={(availability) => setFormData((prev) => ({ ...prev, cateringAvailability: availability }))}
                      />
                    </div>
                  )}

                  {/* Entertainment-specific fields */}
                  {formData.serviceType === 'entertainment' && (
                    <div className="space-y-6 border-t border-slate-200 pt-6">
                      <h3 className="text-lg font-semibold text-slate-900">Entertainment Details</h3>

                      <div className="grid gap-4 sm:grid-cols-2">
                        <Input
                          type="number"
                          name="entertainmentMinDuration"
                          value={formData.entertainmentMinDuration || ''}
                          onChange={handleNumberChange}
                          label="Minimum Duration (minutes)"
                          placeholder="30"
                          min="1"
                          required
                        />
                        <Input
                          type="number"
                          name="entertainmentMaxDuration"
                          value={formData.entertainmentMaxDuration || ''}
                          onChange={handleNumberChange}
                          label="Maximum Duration (minutes)"
                          placeholder="240"
                          min="1"
                          required
                        />
                      </div>

                      <div className="grid gap-4 sm:grid-cols-2">
                        <Input
                          type="number"
                          name="entertainmentHourlyRateMin"
                          value={formData.entertainmentHourlyRateMin || ''}
                          onChange={handleNumberChange}
                          label="Minimum Hourly Rate ($)"
                          placeholder="100"
                          min="0"
                          required
                        />
                        <Input
                          type="number"
                          name="entertainmentHourlyRateMax"
                          value={formData.entertainmentHourlyRateMax || ''}
                          onChange={handleNumberChange}
                          label="Maximum Hourly Rate ($)"
                          placeholder="500"
                          min="0"
                          required
                        />
                      </div>

                      <div>
                        <label className="mb-3 block text-sm font-medium text-slate-700">Entertainment Types</label>
                        <div className="flex flex-wrap gap-2">
                          {ENTERTAINMENT_TYPES.map((entType) => {
                            const isSelected = formData.entertainmentTypes.includes(entType);
                            return (
                              <button
                                key={entType}
                                type="button"
                                onClick={() => toggleArrayItem('entertainmentTypes', entType)}
                                className={cn(
                                  'px-3 py-1.5 rounded-full text-sm font-medium transition-all',
                                  isSelected
                                    ? 'bg-primary-100 text-primary-700 border-2 border-primary-300'
                                    : 'bg-slate-100 text-slate-600 border-2 border-transparent hover:bg-slate-200'
                                )}
                              >
                                {entType}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      <div>
                        <label className="mb-3 block text-sm font-medium text-slate-700">Equipment Provided</label>
                        <div className="flex flex-wrap gap-2">
                          {ENTERTAINMENT_EQUIPMENT.map((equipment) => {
                            const isSelected = formData.entertainmentEquipment.includes(equipment);
                            return (
                              <button
                                key={equipment}
                                type="button"
                                onClick={() => toggleArrayItem('entertainmentEquipment', equipment)}
                                className={cn(
                                  'px-3 py-1.5 rounded-full text-sm font-medium transition-all',
                                  isSelected
                                    ? 'bg-primary-100 text-primary-700 border-2 border-primary-300'
                                    : 'bg-slate-100 text-slate-600 border-2 border-transparent hover:bg-slate-200'
                                )}
                              >
                                {equipment}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      <AvailabilitySchedule
                        availability={formData.entertainmentAvailability}
                        onChange={(availability) => setFormData((prev) => ({ ...prev, entertainmentAvailability: availability }))}
                      />
                    </div>
                  )}

                  {/* Rentals-specific fields */}
                  {formData.serviceType === 'rentals' && (
                    <div className="space-y-6 border-t border-slate-200 pt-6">
                      <h3 className="text-lg font-semibold text-slate-900">Rentals Details</h3>

                      <div className="grid gap-4 sm:grid-cols-2">
                        <Input
                          type="number"
                          name="rentalsMinOrderSize"
                          value={formData.rentalsMinOrderSize || ''}
                          onChange={handleNumberChange}
                          label="Minimum Order Size (items)"
                          placeholder="10"
                          min="1"
                          required
                        />
                        <Input
                          type="number"
                          name="rentalsMaxOrderSize"
                          value={formData.rentalsMaxOrderSize || ''}
                          onChange={handleNumberChange}
                          label="Maximum Order Size (items)"
                          placeholder="500"
                          min="1"
                          required
                        />
                      </div>

                      <div>
                        <label className="mb-3 block text-sm font-medium text-slate-700">Rental Types</label>
                        <div className="flex flex-wrap gap-2">
                          {RENTAL_TYPES.map((rentalType) => {
                            const isSelected = formData.rentalTypes.includes(rentalType);
                            return (
                              <button
                                key={rentalType}
                                type="button"
                                onClick={() => toggleArrayItem('rentalTypes', rentalType)}
                                className={cn(
                                  'px-3 py-1.5 rounded-full text-sm font-medium transition-all',
                                  isSelected
                                    ? 'bg-primary-100 text-primary-700 border-2 border-primary-300'
                                    : 'bg-slate-100 text-slate-600 border-2 border-transparent hover:bg-slate-200'
                                )}
                              >
                                {rentalType}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Itemized Pricing Table */}
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <label className="block text-sm font-medium text-slate-700">Itemized Pricing</label>
                          <button
                            type="button"
                            onClick={addRentalPricingItem}
                            className="text-sm font-medium text-primary-600 hover:text-primary-700"
                          >
                            + Add Item
                          </button>
                        </div>

                        {formData.rentalItemizedPricing.length > 0 ? (
                          <div className="overflow-hidden rounded-lg border border-slate-200">
                            <table className="w-full">
                              <thead className="bg-slate-50">
                                <tr>
                                  <th className="px-3 py-2 text-left text-xs font-semibold text-slate-700">Item Type</th>
                                  <th className="px-3 py-2 text-left text-xs font-semibold text-slate-700">Price/Item ($)</th>
                                  <th className="px-3 py-2 text-left text-xs font-semibold text-slate-700">Max Qty</th>
                                  <th className="px-3 py-2"></th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-200">
                                {formData.rentalItemizedPricing.map((item, index) => (
                                  <tr key={index} className="bg-white">
                                    <td className="px-3 py-2">
                                      <input
                                        type="text"
                                        placeholder="e.g. Folding Chair"
                                        value={item.itemType}
                                        onChange={(e) => updateRentalPricing(index, 'itemType', e.target.value)}
                                        className="w-full rounded border border-slate-300 px-2 py-1 text-sm"
                                      />
                                    </td>
                                    <td className="px-3 py-2">
                                      <input
                                        type="number"
                                        placeholder="5.00"
                                        value={item.pricePerItem || ''}
                                        onChange={(e) => updateRentalPricing(index, 'pricePerItem', parseFloat(e.target.value) || 0)}
                                        className="w-full rounded border border-slate-300 px-2 py-1 text-sm"
                                      />
                                    </td>
                                    <td className="px-3 py-2">
                                      <input
                                        type="number"
                                        placeholder="100"
                                        value={item.maxQuantity || ''}
                                        onChange={(e) => updateRentalPricing(index, 'maxQuantity', parseInt(e.target.value) || 0)}
                                        className="w-full rounded border border-slate-300 px-2 py-1 text-sm"
                                      />
                                    </td>
                                    <td className="px-3 py-2 text-center">
                                      <button
                                        type="button"
                                        onClick={() => removeRentalPricingItem(index)}
                                        className="text-slate-400 hover:text-red-500"
                                      >
                                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                      </button>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        ) : (
                          <div className="rounded-lg border-2 border-dashed border-slate-300 p-6 text-center">
                            <p className="text-sm text-slate-500">No items added yet.</p>
                            <button
                              type="button"
                              onClick={addRentalPricingItem}
                              className="mt-2 text-sm font-medium text-primary-600 hover:text-primary-700"
                            >
                              Add your first item
                            </button>
                          </div>
                        )}
                      </div>

                      <div>
                        <label className="mb-3 block text-sm font-medium text-slate-700">Services Offered</label>
                        <div className="flex flex-wrap gap-2">
                          {RENTALS_SERVICES.map((service) => {
                            const isSelected = formData.rentalServices.includes(service);
                            return (
                              <button
                                key={service}
                                type="button"
                                onClick={() => toggleArrayItem('rentalServices', service)}
                                className={cn(
                                  'px-3 py-1.5 rounded-full text-sm font-medium transition-all',
                                  isSelected
                                    ? 'bg-primary-100 text-primary-700 border-2 border-primary-300'
                                    : 'bg-slate-100 text-slate-600 border-2 border-transparent hover:bg-slate-200'
                                )}
                              >
                                {service}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      <AvailabilitySchedule
                        availability={formData.rentalsAvailability}
                        onChange={(availability) => setFormData((prev) => ({ ...prev, rentalsAvailability: availability }))}
                      />
                    </div>
                  )}

                  {/* Photos */}
                  <div className="space-y-6 border-t border-slate-200 pt-6">
                    <div>
                      <h3 className="text-lg font-semibold text-slate-900">Package Photos</h3>
                      <p className="mt-1 text-sm text-slate-600">
                        Upload photos of your {SERVICE_LABELS[formData.serviceType].toLowerCase()} (up to 15 images)
                      </p>
                    </div>

                    {formData.name ? (
                      <PhotoUpload
                        bucketName="package-photos"
                        folderId={formData.name.replace(/\s+/g, '-').toLowerCase()}
                        maxPhotos={15}
                        existingPhotos={formData.photos}
                        onUpload={handlePhotosUploaded}
                      />
                    ) : (
                      <div className="rounded-lg border-2 border-dashed border-slate-300 p-8 text-center">
                        <p className="text-sm text-slate-600">
                          Please fill in the package name above to enable photo uploads
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Form Actions */}
                  <div className="flex gap-4 border-t border-slate-200 pt-6">
                    <Button
                      type="button"
                      variant="outline"
                      className="flex-1"
                      onClick={(e) => {
                        e.preventDefault();
                        const syntheticEvent = { preventDefault: () => {} } as React.FormEvent<HTMLFormElement>;
                        handleSubmit(syntheticEvent, 'draft');
                      }}
                      disabled={loading}
                    >
                      {loading ? 'Saving...' : 'Save as Draft'}
                    </Button>
                    <Button type="submit" className="flex-1" disabled={loading}>
                      {loading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Publishing...
                        </>
                      ) : (
                        'Publish Package'
                      )}
                    </Button>
                  </div>
                </>
              )}
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
