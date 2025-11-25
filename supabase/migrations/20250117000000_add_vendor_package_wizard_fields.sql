-- DAM Event Platform - Vendor Package Wizard Enhancements
-- Add fields for multi-step vendor onboarding and enhanced package creation

-- =====================================================
-- ALTER VENDORS TABLE
-- =====================================================

-- Add event_types array to track what types of events the vendor hosts
ALTER TABLE public.vendors
ADD COLUMN IF NOT EXISTS event_types TEXT[] DEFAULT ARRAY[]::TEXT[];

-- Add country field for vendor location
ALTER TABLE public.vendors
ADD COLUMN IF NOT EXISTS country TEXT DEFAULT 'United States';

-- Add city field for better location filtering
ALTER TABLE public.vendors
ADD COLUMN IF NOT EXISTS city TEXT;

-- Add state field for better location filtering
ALTER TABLE public.vendors
ADD COLUMN IF NOT EXISTS state TEXT;

-- Add zip_code field
ALTER TABLE public.vendors
ADD COLUMN IF NOT EXISTS zip_code TEXT;

-- Add comment for event_types column
COMMENT ON COLUMN public.vendors.event_types IS
'Array of event types the vendor hosts: Weddings, Birthday Party, Corporate Event, etc.';

-- =====================================================
-- ALTER PACKAGES TABLE
-- =====================================================

-- Add hourly rate fields as top-level columns for easier querying
ALTER TABLE public.packages
ADD COLUMN IF NOT EXISTS hourly_rate_min DECIMAL(10, 2);

ALTER TABLE public.packages
ADD COLUMN IF NOT EXISTS hourly_rate_max DECIMAL(10, 2);

-- Add embedding column for AI-powered natural language search (skip if exists)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'packages'
    AND column_name = 'embedding'
  ) THEN
    ALTER TABLE public.packages ADD COLUMN embedding vector(1536);
  END IF;
END $$;

-- Add comment for venue_details to document new structure
COMMENT ON COLUMN public.packages.venue_details IS
'JSONB structure: {
  name: string,
  min_capacity: number,
  max_capacity: number,
  square_footage: number,
  short_description: string,
  amenities: string[],
  availability: {
    monday: { isOpen: boolean, openTime: string, closeTime: string },
    tuesday: { isOpen: boolean, openTime: string, closeTime: string },
    wednesday: { isOpen: boolean, openTime: string, closeTime: string },
    thursday: { isOpen: boolean, openTime: string, closeTime: string },
    friday: { isOpen: boolean, openTime: string, closeTime: string },
    saturday: { isOpen: boolean, openTime: string, closeTime: string },
    sunday: { isOpen: boolean, openTime: string, closeTime: string }
  },
  exception_dates: Array<{ date: string, reason: string }>
}';

-- =====================================================
-- CREATE INDEXES FOR NEW FIELDS
-- =====================================================

-- Index on event_types for filtering packages by event type
CREATE INDEX IF NOT EXISTS idx_vendors_event_types ON public.vendors USING GIN (event_types);

-- Index on country for location filtering
CREATE INDEX IF NOT EXISTS idx_vendors_country ON public.vendors(country);

-- Index on hourly rates for budget filtering
CREATE INDEX IF NOT EXISTS idx_packages_hourly_rates ON public.packages(hourly_rate_min, hourly_rate_max);

-- GIN index on venue_details JSONB for faster JSON queries
CREATE INDEX IF NOT EXISTS idx_packages_venue_details ON public.packages USING GIN (venue_details);

-- Vector index for similarity search on embeddings
-- NOTE: Skipping vector index creation in migration due to memory constraints
-- To create the index later when you have data and proper memory settings, run:
-- CREATE INDEX IF NOT EXISTS idx_packages_embedding ON public.packages
-- USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);
--
-- For now, the embedding column exists and can be used for vector similarity search
-- The index will improve performance but is not required for basic functionality

-- =====================================================
-- HELPER FUNCTIONS
-- =====================================================

-- Function to extract amenities from venue_details for searching
CREATE OR REPLACE FUNCTION get_package_amenities(package_id UUID)
RETURNS TEXT[] AS $$
  SELECT COALESCE(
    ARRAY(
      SELECT jsonb_array_elements_text(venue_details->'amenities')
      FROM public.packages
      WHERE id = package_id
    ),
    ARRAY[]::TEXT[]
  );
$$ LANGUAGE SQL STABLE;

-- Function to check if a package is available on a specific day
CREATE OR REPLACE FUNCTION is_package_available_on_day(
  package_id UUID,
  day_of_week TEXT
)
RETURNS BOOLEAN AS $$
  SELECT COALESCE(
    (venue_details->'availability'->day_of_week->>'isOpen')::BOOLEAN,
    TRUE
  )
  FROM public.packages
  WHERE id = package_id;
$$ LANGUAGE SQL STABLE;

-- Function to get searchable text for a package (for embedding generation)
CREATE OR REPLACE FUNCTION get_package_searchable_text(package_id UUID)
RETURNS TEXT AS $$
DECLARE
  result TEXT;
  pkg RECORD;
  amenities_text TEXT;
  event_types_text TEXT;
  availability_text TEXT;
BEGIN
  SELECT
    p.name,
    p.description,
    p.venue_details,
    p.catering_details,
    p.entertainment_details,
    p.hourly_rate_min,
    p.hourly_rate_max,
    p.capacity,
    v.business_name,
    v.description as vendor_description,
    v.location_address,
    v.city,
    v.state,
    v.country,
    v.event_types
  INTO pkg
  FROM public.packages p
  JOIN public.vendors v ON p.vendor_id = v.id
  WHERE p.id = package_id;

  -- Extract amenities
  amenities_text := COALESCE(
    (SELECT string_agg(value::TEXT, ', ')
     FROM jsonb_array_elements_text(pkg.venue_details->'amenities')),
    ''
  );

  -- Extract event types
  event_types_text := COALESCE(array_to_string(pkg.event_types, ', '), '');

  -- Build availability text
  availability_text := 'Available ';
  IF (pkg.venue_details->'availability'->'monday'->>'isOpen')::BOOLEAN THEN
    availability_text := availability_text || 'Monday ';
  END IF;
  IF (pkg.venue_details->'availability'->'tuesday'->>'isOpen')::BOOLEAN THEN
    availability_text := availability_text || 'Tuesday ';
  END IF;
  IF (pkg.venue_details->'availability'->'wednesday'->>'isOpen')::BOOLEAN THEN
    availability_text := availability_text || 'Wednesday ';
  END IF;
  IF (pkg.venue_details->'availability'->'thursday'->>'isOpen')::BOOLEAN THEN
    availability_text := availability_text || 'Thursday ';
  END IF;
  IF (pkg.venue_details->'availability'->'friday'->>'isOpen')::BOOLEAN THEN
    availability_text := availability_text || 'Friday ';
  END IF;
  IF (pkg.venue_details->'availability'->'saturday'->>'isOpen')::BOOLEAN THEN
    availability_text := availability_text || 'Saturday ';
  END IF;
  IF (pkg.venue_details->'availability'->'sunday'->>'isOpen')::BOOLEAN THEN
    availability_text := availability_text || 'Sunday ';
  END IF;

  -- Combine all searchable text
  result := CONCAT_WS(' | ',
    'Package: ' || pkg.name,
    'Description: ' || pkg.description,
    'Venue: ' || pkg.business_name,
    'Vendor Description: ' || pkg.vendor_description,
    'Location: ' || pkg.location_address || ' ' || COALESCE(pkg.city, '') || ' ' || COALESCE(pkg.state, '') || ' ' || COALESCE(pkg.country, ''),
    'Amenities: ' || amenities_text,
    'Event Types: ' || event_types_text,
    'Capacity: ' || pkg.capacity || ' guests',
    'Hourly Rate: $' || COALESCE(pkg.hourly_rate_min::TEXT, 'N/A') || ' - $' || COALESCE(pkg.hourly_rate_max::TEXT, 'N/A'),
    availability_text,
    'Venue Details: ' || COALESCE(pkg.venue_details->>'short_description', ''),
    'Catering: ' || COALESCE(pkg.catering_details::TEXT, ''),
    'Entertainment: ' || COALESCE(pkg.entertainment_details::TEXT, '')
  );

  RETURN result;
END;
$$ LANGUAGE plpgsql STABLE;

-- =====================================================
-- COMMENTS FOR DOCUMENTATION
-- =====================================================

COMMENT ON COLUMN public.packages.hourly_rate_min IS 'Minimum hourly rental rate for the venue in USD';
COMMENT ON COLUMN public.packages.hourly_rate_max IS 'Maximum hourly rental rate for the venue in USD';
COMMENT ON COLUMN public.packages.embedding IS 'Vector embedding for AI-powered natural language search (1536 dimensions for OpenAI ada-002)';
