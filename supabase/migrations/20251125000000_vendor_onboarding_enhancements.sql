-- DAM Event Platform - Vendor Onboarding Enhancements
-- Add fields for service-specific onboarding flow (Catering, Entertainment, Rentals)

-- =====================================================
-- ALTER VENDORS TABLE
-- =====================================================

-- Add onboarding_completed flag to track if vendor finished the wizard
ALTER TABLE public.vendors
ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT FALSE;

-- Add food_types for catering vendors
ALTER TABLE public.vendors
ADD COLUMN IF NOT EXISTS food_types TEXT[] DEFAULT ARRAY[]::TEXT[];

-- Add entertainment_types for entertainment vendors
ALTER TABLE public.vendors
ADD COLUMN IF NOT EXISTS entertainment_types TEXT[] DEFAULT ARRAY[]::TEXT[];

-- Add rental_types for rental vendors
ALTER TABLE public.vendors
ADD COLUMN IF NOT EXISTS rental_types TEXT[] DEFAULT ARRAY[]::TEXT[];

-- Add delivery_options for rental vendors
ALTER TABLE public.vendors
ADD COLUMN IF NOT EXISTS delivery_options TEXT[] DEFAULT ARRAY[]::TEXT[];

-- =====================================================
-- ALTER PACKAGES TABLE
-- =====================================================

-- Add rental_details JSONB field for rental-specific information
ALTER TABLE public.packages
ADD COLUMN IF NOT EXISTS rental_details JSONB;

-- Add service_type to identify what type of service this package is for
ALTER TABLE public.packages
ADD COLUMN IF NOT EXISTS service_type TEXT CHECK (service_type IN ('venue', 'catering', 'entertainment', 'rentals'));

-- Add price_per_person fields for catering
ALTER TABLE public.packages
ADD COLUMN IF NOT EXISTS price_per_person_min DECIMAL(10, 2);

ALTER TABLE public.packages
ADD COLUMN IF NOT EXISTS price_per_person_max DECIMAL(10, 2);

-- Add performance_duration fields for entertainment (in minutes)
ALTER TABLE public.packages
ADD COLUMN IF NOT EXISTS performance_duration_min INTEGER;

ALTER TABLE public.packages
ADD COLUMN IF NOT EXISTS performance_duration_max INTEGER;

-- Add equipment_provided array for entertainment
ALTER TABLE public.packages
ADD COLUMN IF NOT EXISTS equipment_provided TEXT[] DEFAULT ARRAY[]::TEXT[];

-- Add services_offered array for catering/rentals (Buffet Service, Setup, etc.)
ALTER TABLE public.packages
ADD COLUMN IF NOT EXISTS services_offered TEXT[] DEFAULT ARRAY[]::TEXT[];

-- =====================================================
-- CREATE INDEXES FOR NEW FIELDS
-- =====================================================

-- Index on onboarding_completed for filtering
CREATE INDEX IF NOT EXISTS idx_vendors_onboarding_completed ON public.vendors(onboarding_completed);

-- Index on food_types for catering filtering
CREATE INDEX IF NOT EXISTS idx_vendors_food_types ON public.vendors USING GIN (food_types);

-- Index on entertainment_types for filtering
CREATE INDEX IF NOT EXISTS idx_vendors_entertainment_types ON public.vendors USING GIN (entertainment_types);

-- Index on rental_types for filtering
CREATE INDEX IF NOT EXISTS idx_vendors_rental_types ON public.vendors USING GIN (rental_types);

-- Index on service_type for package filtering
CREATE INDEX IF NOT EXISTS idx_packages_service_type ON public.packages(service_type);

-- GIN index on rental_details JSONB for faster JSON queries
CREATE INDEX IF NOT EXISTS idx_packages_rental_details ON public.packages USING GIN (rental_details);

-- =====================================================
-- COMMENTS FOR DOCUMENTATION
-- =====================================================

COMMENT ON COLUMN public.vendors.onboarding_completed IS 'Whether the vendor has completed the onboarding wizard';
COMMENT ON COLUMN public.vendors.food_types IS 'Array of food types for catering vendors: BBQ & Grill, Seafood Specialty, Vegetarian, etc.';
COMMENT ON COLUMN public.vendors.entertainment_types IS 'Array of entertainment types: Live Band, DJ Services, Solo Performer, etc.';
COMMENT ON COLUMN public.vendors.rental_types IS 'Array of rental item types: Tables, Chairs, Tents & Canopies, etc.';
COMMENT ON COLUMN public.vendors.delivery_options IS 'Array of delivery options for rentals: Delivery Only, Delivery + Setup, Pickup by client';

COMMENT ON COLUMN public.packages.service_type IS 'The type of service this package is for: venue, catering, entertainment, or rentals';
COMMENT ON COLUMN public.packages.rental_details IS 'JSONB structure for rentals: {
  min_order_size: number,
  max_order_size: number,
  short_description: string,
  itemized_pricing: [{ item_type: string, price_per_item: number, max_quantity: number }],
  availability: WeeklyAvailability,
  exception_dates: ExceptionDate[],
  rental_duration_options: string[]
}';
COMMENT ON COLUMN public.packages.price_per_person_min IS 'Minimum price per person for catering packages';
COMMENT ON COLUMN public.packages.price_per_person_max IS 'Maximum price per person for catering packages';
COMMENT ON COLUMN public.packages.performance_duration_min IS 'Minimum performance duration in minutes for entertainment';
COMMENT ON COLUMN public.packages.performance_duration_max IS 'Maximum performance duration in minutes for entertainment';
COMMENT ON COLUMN public.packages.equipment_provided IS 'Array of equipment provided by entertainment vendors: Stage Lighting, Microphones, etc.';
COMMENT ON COLUMN public.packages.services_offered IS 'Array of additional services: Buffet Service, Plated Service, Setup, Tear Down, etc.';

-- Update catering_details comment with new structure
COMMENT ON COLUMN public.packages.catering_details IS 'JSONB structure for catering: {
  min_guest_count: number,
  max_guest_count: number,
  short_description: string,
  menu_options: string[],
  dietary_accommodations: string[],
  availability: WeeklyAvailability,
  exception_dates: ExceptionDate[]
}';

-- Update entertainment_details comment with new structure
COMMENT ON COLUMN public.packages.entertainment_details IS 'JSONB structure for entertainment: {
  min_performance_duration: number,
  max_performance_duration: number,
  short_description: string,
  type: string,
  equipment: string[],
  availability: WeeklyAvailability,
  exception_dates: ExceptionDate[]
}';
