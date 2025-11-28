/**
 * Vendor Onboarding API Route
 * POST /api/vendors/onboarding - Complete vendor onboarding with all service-specific data
 */

import { createClient } from '@/lib/supabase/route-handler';
import { geocodeAddress } from '@/lib/maps/geocoding';
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { OnboardingFormData, ServiceType } from '@/types';

// Validation schemas
const dayAvailabilitySchema = z.object({
  isOpen: z.boolean(),
  openTime: z.string(),
  closeTime: z.string(),
});

const weeklyAvailabilitySchema = z.object({
  monday: dayAvailabilitySchema,
  tuesday: dayAvailabilitySchema,
  wednesday: dayAvailabilitySchema,
  thursday: dayAvailabilitySchema,
  friday: dayAvailabilitySchema,
  saturday: dayAvailabilitySchema,
  sunday: dayAvailabilitySchema,
});

const step1Schema = z.object({
  services: z.array(z.enum(['venue', 'catering', 'entertainment', 'rentals'])).min(1),
});

const step2Schema = z.object({
  businessName: z.string().min(1, 'Business name is required'),
  phone: z.string().min(1, 'Phone number is required'),
});

const step3Schema = z.object({
  streetAddress: z.string().min(1, 'Street address is required'),
  city: z.string().min(1, 'City is required'),
  state: z.string().min(1, 'State is required'),
  zipCode: z.string().min(1, 'ZIP code is required'),
  country: z.string().min(1, 'Country is required'),
});

const venueStep4Schema = z.object({
  eventTypes: z.array(z.string()).min(1),
}).optional();

const venueStep5Schema = z.object({
  minCapacity: z.number().min(1),
  maxCapacity: z.number().min(1),
  squareFootage: z.number().optional(),
  shortDescription: z.string(),
  hourlyRateMin: z.number().min(0),
  hourlyRateMax: z.number().min(0),
  amenities: z.array(z.string()),
  availability: weeklyAvailabilitySchema,
  exceptionDates: z.array(z.object({
    date: z.string(),
    reason: z.string(),
  })),
  photos: z.array(z.string()),
}).optional();

const cateringStep4Schema = z.object({
  foodTypes: z.array(z.string()).min(1),
}).optional();

const cateringStep5Schema = z.object({
  minGuestCount: z.number().min(1),
  maxGuestCount: z.number().min(1),
  shortDescription: z.string(),
  pricePerPersonMin: z.number().min(0),
  pricePerPersonMax: z.number().min(0),
  servicesOffered: z.array(z.string()),
  availability: weeklyAvailabilitySchema,
  exceptionDates: z.array(z.object({
    date: z.string(),
    reason: z.string(),
  })),
  photos: z.array(z.string()),
}).optional();

const entertainmentStep4Schema = z.object({
  entertainmentTypes: z.array(z.string()).min(1),
}).optional();

const entertainmentStep5Schema = z.object({
  minPerformanceDuration: z.number().min(1),
  maxPerformanceDuration: z.number().min(1),
  shortDescription: z.string(),
  hourlyRateMin: z.number().min(0),
  hourlyRateMax: z.number().min(0),
  equipmentProvided: z.array(z.string()),
  availability: weeklyAvailabilitySchema,
  exceptionDates: z.array(z.object({
    date: z.string(),
    reason: z.string(),
  })),
  photos: z.array(z.string()),
}).optional();

const rentalsStep4Schema = z.object({
  rentalTypes: z.array(z.string()).min(1),
  deliveryOptions: z.array(z.string()),
}).optional();

const rentalsStep5Schema = z.object({
  minOrderSize: z.number().min(1),
  maxOrderSize: z.number().min(1),
  shortDescription: z.string(),
  itemizedPricing: z.array(z.object({
    itemType: z.string(),
    pricePerItem: z.number(),
    maxQuantity: z.number(),
  })),
  servicesOffered: z.array(z.string()),
  availability: weeklyAvailabilitySchema,
  exceptionDates: z.array(z.object({
    date: z.string(),
    reason: z.string(),
  })),
  photos: z.array(z.string()),
}).optional();

const onboardingSchema = z.object({
  step1: step1Schema,
  step2: step2Schema,
  step3: step3Schema,
  venueStep4: venueStep4Schema,
  venueStep5: venueStep5Schema,
  cateringStep4: cateringStep4Schema,
  cateringStep5: cateringStep5Schema,
  entertainmentStep4: entertainmentStep4Schema,
  entertainmentStep5: entertainmentStep5Schema,
  rentalsStep4: rentalsStep4Schema,
  rentalsStep5: rentalsStep5Schema,
});

export async function POST(request: Request) {
  try {
    const supabase = createClient();

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { data: null, error: { message: 'Unauthorized', code: 'AUTH_ERROR' } },
        { status: 401 }
      );
    }

    // Verify user is a vendor
    const { data: userProfile } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single();

    if (userProfile?.role !== 'vendor') {
      return NextResponse.json(
        { data: null, error: { message: 'Only vendors can complete onboarding', code: 'FORBIDDEN' } },
        { status: 403 }
      );
    }

    // Check if vendor profile already exists
    const { data: existingVendor } = await supabase
      .from('vendors')
      .select('id')
      .eq('user_id', user.id)
      .maybeSingle();

    if (existingVendor) {
      return NextResponse.json(
        { data: null, error: { message: 'Vendor profile already exists', code: 'ALREADY_EXISTS' } },
        { status: 400 }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const validatedData = onboardingSchema.parse(body) as OnboardingFormData;

    // Build full address for geocoding
    const fullAddress = `${validatedData.step3.streetAddress}, ${validatedData.step3.city}, ${validatedData.step3.state} ${validatedData.step3.zipCode}, ${validatedData.step3.country}`;

    // Geocode the address
    const geocodeResult = await geocodeAddress(fullAddress);

    // Gather all event types from venue selection
    const eventTypes = validatedData.venueStep4?.eventTypes || [];

    // Gather food types from catering selection
    const foodTypes = validatedData.cateringStep4?.foodTypes || [];

    // Gather entertainment types
    const entertainmentTypes = validatedData.entertainmentStep4?.entertainmentTypes || [];

    // Gather rental types
    const rentalTypes = validatedData.rentalsStep4?.rentalTypes || [];

    // Gather delivery options
    const deliveryOptions = validatedData.rentalsStep4?.deliveryOptions || [];

    // Build description from all service descriptions
    const descriptions: string[] = [];
    if (validatedData.venueStep5?.shortDescription) {
      descriptions.push(`Venue: ${validatedData.venueStep5.shortDescription}`);
    }
    if (validatedData.cateringStep5?.shortDescription) {
      descriptions.push(`Catering: ${validatedData.cateringStep5.shortDescription}`);
    }
    if (validatedData.entertainmentStep5?.shortDescription) {
      descriptions.push(`Entertainment: ${validatedData.entertainmentStep5.shortDescription}`);
    }
    if (validatedData.rentalsStep5?.shortDescription) {
      descriptions.push(`Rentals: ${validatedData.rentalsStep5.shortDescription}`);
    }
    const combinedDescription = descriptions.join('\n\n');

    // Create vendor profile (using only existing database columns)
    const { data: vendor, error: vendorError } = await supabase
      .from('vendors')
      .insert({
        user_id: user.id,
        business_name: validatedData.step2.businessName,
        description: combinedDescription || 'No description provided',
        services: validatedData.step1.services,
        location_address: geocodeResult?.formatted_address || fullAddress,
        location_lat: geocodeResult?.lat || null,
        location_lng: geocodeResult?.lng || null,
        city: validatedData.step3.city,
        state: validatedData.step3.state,
        zip_code: validatedData.step3.zipCode,
        country: validatedData.step3.country,
        event_types: eventTypes,
        status: 'pending', // Requires admin verification
      })
      .select()
      .single();

    if (vendorError) {
      console.error('Error creating vendor:', vendorError);
      return NextResponse.json(
        { data: null, error: { message: vendorError.message, code: 'DB_ERROR' } },
        { status: 500 }
      );
    }

    // Update user's phone number
    if (validatedData.step2.phone) {
      await supabase
        .from('users')
        .update({ phone: validatedData.step2.phone })
        .eq('id', user.id);
    }

    // Create initial packages for each service type
    const packagesCreated: string[] = [];

    // Helper function to create packages for each service (using only existing database columns)
    const createServicePackage = async (
      serviceType: ServiceType,
      packageData: {
        name: string;
        description: string;
        price_min: number;
        price_max: number;
        capacity?: number;
        venue_details?: object;
        catering_details?: object;
        entertainment_details?: object;
      }
    ) => {
      const { data: pkg, error: pkgError } = await supabase
        .from('packages')
        .insert({
          vendor_id: vendor.id,
          name: packageData.name,
          description: packageData.description,
          price_min: packageData.price_min,
          price_max: packageData.price_max,
          capacity: packageData.capacity || 0,
          venue_details: packageData.venue_details || null,
          catering_details: packageData.catering_details || null,
          entertainment_details: packageData.entertainment_details || null,
          status: 'draft',
          photos: [],
        })
        .select()
        .single();

      if (pkgError) {
        console.error(`Error creating ${serviceType} package:`, pkgError);
      } else if (pkg) {
        packagesCreated.push(pkg.id);
      }
    };

    // Create venue package if applicable
    if (validatedData.venueStep5 && validatedData.step1.services.includes('venue')) {
      const venueData = validatedData.venueStep5;
      await createServicePackage('venue', {
        name: `${validatedData.step2.businessName} - Venue`,
        description: venueData.shortDescription || '',
        price_min: venueData.hourlyRateMin,
        price_max: venueData.hourlyRateMax,
        capacity: venueData.maxCapacity,
        venue_details: {
          name: validatedData.step2.businessName,
          min_capacity: venueData.minCapacity,
          max_capacity: venueData.maxCapacity,
          square_footage: venueData.squareFootage,
          amenities: venueData.amenities,
          availability: venueData.availability,
          exception_dates: venueData.exceptionDates,
        },
      });
    }

    // Create catering package if applicable
    if (validatedData.cateringStep5 && validatedData.step1.services.includes('catering')) {
      const cateringData = validatedData.cateringStep5;
      await createServicePackage('catering', {
        name: `${validatedData.step2.businessName} - Catering`,
        description: cateringData.shortDescription || '',
        price_min: cateringData.pricePerPersonMin * cateringData.minGuestCount,
        price_max: cateringData.pricePerPersonMax * cateringData.maxGuestCount,
        capacity: cateringData.maxGuestCount,
        catering_details: {
          menu_options: validatedData.cateringStep4?.foodTypes || [],
          dietary_accommodations: [],
          services_offered: cateringData.servicesOffered,
          min_guest_count: cateringData.minGuestCount,
          max_guest_count: cateringData.maxGuestCount,
          price_per_person_min: cateringData.pricePerPersonMin,
          price_per_person_max: cateringData.pricePerPersonMax,
          availability: cateringData.availability,
          exception_dates: cateringData.exceptionDates,
        },
      });
    }

    // Create entertainment package if applicable
    if (validatedData.entertainmentStep5 && validatedData.step1.services.includes('entertainment')) {
      const entertainmentData = validatedData.entertainmentStep5;
      await createServicePackage('entertainment', {
        name: `${validatedData.step2.businessName} - Entertainment`,
        description: entertainmentData.shortDescription || '',
        price_min: entertainmentData.hourlyRateMin,
        price_max: entertainmentData.hourlyRateMax,
        entertainment_details: {
          type: validatedData.entertainmentStep4?.entertainmentTypes?.[0] || 'General',
          equipment: entertainmentData.equipmentProvided,
          min_duration: entertainmentData.minPerformanceDuration,
          max_duration: entertainmentData.maxPerformanceDuration,
          availability: entertainmentData.availability,
          exception_dates: entertainmentData.exceptionDates,
        },
      });
    }

    // Create rentals package if applicable (store rental details in entertainment_details for now)
    if (validatedData.rentalsStep5 && validatedData.step1.services.includes('rentals')) {
      const rentalsData = validatedData.rentalsStep5;
      // Calculate price range from itemized pricing
      const prices = rentalsData.itemizedPricing.map(item => item.pricePerItem);
      const minPrice = prices.length > 0 ? Math.min(...prices) * rentalsData.minOrderSize : 0;
      const maxPrice = prices.length > 0 ? Math.max(...prices) * rentalsData.maxOrderSize : 0;

      // Store rental details in entertainment_details temporarily until migration is applied
      await createServicePackage('rentals', {
        name: `${validatedData.step2.businessName} - Rentals`,
        description: rentalsData.shortDescription || '',
        price_min: minPrice,
        price_max: maxPrice,
        entertainment_details: {
          type: 'rentals',
          rental_types: validatedData.rentalsStep4?.rentalTypes || [],
          delivery_options: validatedData.rentalsStep4?.deliveryOptions || [],
          min_order_size: rentalsData.minOrderSize,
          max_order_size: rentalsData.maxOrderSize,
          itemized_pricing: rentalsData.itemizedPricing,
          services_offered: rentalsData.servicesOffered,
          availability: rentalsData.availability,
          exception_dates: rentalsData.exceptionDates,
          equipment: [],
        },
      });
    }

    return NextResponse.json(
      {
        data: {
          vendor,
          packagesCreated: packagesCreated.length,
        },
        error: null,
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          data: null,
          error: {
            message: 'Invalid input',
            code: 'VALIDATION_ERROR',
            details: error.errors,
          },
        },
        { status: 400 }
      );
    }

    console.error('Unexpected error:', error);
    return NextResponse.json(
      { data: null, error: { message: 'Internal server error', code: 'INTERNAL_ERROR' } },
      { status: 500 }
    );
  }
}
