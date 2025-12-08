-- DAM Event Platform - Add Vector Embeddings for RAG
-- Enable semantic search using pgvector

-- Enable pgvector extension for vector similarity search
CREATE EXTENSION IF NOT EXISTS vector;

-- Add embedding columns to packages table (main search target)
ALTER TABLE public.packages
ADD COLUMN IF NOT EXISTS embedding vector(384),
ADD COLUMN IF NOT EXISTS searchable_text TEXT;

-- Add embedding columns to vendors table
ALTER TABLE public.vendors
ADD COLUMN IF NOT EXISTS embedding vector(384),
ADD COLUMN IF NOT EXISTS searchable_text TEXT;

-- Add embedding columns to events table (for matching)
ALTER TABLE public.events
ADD COLUMN IF NOT EXISTS embedding vector(384),
ADD COLUMN IF NOT EXISTS searchable_text TEXT;

-- Create indexes for vector similarity search (using HNSW for speed)
CREATE INDEX IF NOT EXISTS packages_embedding_idx ON public.packages 
USING hnsw (embedding vector_cosine_ops);

CREATE INDEX IF NOT EXISTS vendors_embedding_idx ON public.vendors 
USING hnsw (embedding vector_cosine_ops);

CREATE INDEX IF NOT EXISTS events_embedding_idx ON public.events 
USING hnsw (embedding vector_cosine_ops);

-- Function to generate searchable text for packages
CREATE OR REPLACE FUNCTION generate_package_searchable_text(pkg public.packages)
RETURNS TEXT AS $$
BEGIN
  RETURN CONCAT_WS(' ',
    pkg.name,
    pkg.description,
    COALESCE(pkg.venue_details->>'name', ''),
    ARRAY_TO_STRING(COALESCE(ARRAY(SELECT jsonb_array_elements_text(pkg.venue_details->'amenities')), ARRAY[]::text[]), ' '),
    ARRAY_TO_STRING(COALESCE(ARRAY(SELECT jsonb_array_elements_text(pkg.catering_details->'menu_options')), ARRAY[]::text[]), ' '),
    ARRAY_TO_STRING(COALESCE(ARRAY(SELECT jsonb_array_elements_text(pkg.catering_details->'dietary_accommodations')), ARRAY[]::text[]), ' '),
    COALESCE(pkg.entertainment_details->>'type', ''),
    'capacity: ' || pkg.capacity::TEXT,
    'price: $' || pkg.price_min::TEXT || ' to $' || pkg.price_max::TEXT
  );
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Function to generate searchable text for vendors
CREATE OR REPLACE FUNCTION generate_vendor_searchable_text(v public.vendors)
RETURNS TEXT AS $$
BEGIN
  RETURN CONCAT_WS(' ',
    v.business_name,
    v.description,
    ARRAY_TO_STRING(v.services, ' '),
    v.location_address
  );
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Function to generate searchable text for events
CREATE OR REPLACE FUNCTION generate_event_searchable_text(e public.events)
RETURNS TEXT AS $$
BEGIN
  RETURN CONCAT_WS(' ',
    e.event_type,
    e.description,
    e.location_address,
    'budget: $' || e.budget::TEXT,
    'guests: ' || e.guest_count::TEXT
  );
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Trigger to auto-update searchable text on package changes
CREATE OR REPLACE FUNCTION update_package_searchable_text()
RETURNS TRIGGER AS $$
BEGIN
  NEW.searchable_text = generate_package_searchable_text(NEW);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS package_searchable_text_trigger ON public.packages;
CREATE TRIGGER package_searchable_text_trigger
BEFORE INSERT OR UPDATE ON public.packages
FOR EACH ROW
EXECUTE FUNCTION update_package_searchable_text();

-- Trigger for vendors
CREATE OR REPLACE FUNCTION update_vendor_searchable_text()
RETURNS TRIGGER AS $$
BEGIN
  NEW.searchable_text = generate_vendor_searchable_text(NEW);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS vendor_searchable_text_trigger ON public.vendors;
CREATE TRIGGER vendor_searchable_text_trigger
BEFORE INSERT OR UPDATE ON public.vendors
FOR EACH ROW
EXECUTE FUNCTION update_vendor_searchable_text();

-- Trigger for events
CREATE OR REPLACE FUNCTION update_event_searchable_text()
RETURNS TRIGGER AS $$
BEGIN
  NEW.searchable_text = generate_event_searchable_text(NEW);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS event_searchable_text_trigger ON public.events;
CREATE TRIGGER event_searchable_text_trigger
BEFORE INSERT OR UPDATE ON public.events
FOR EACH ROW
EXECUTE FUNCTION update_event_searchable_text();

-- Update existing records with searchable text
UPDATE public.packages 
SET searchable_text = generate_package_searchable_text(packages.*);

UPDATE public.vendors 
SET searchable_text = generate_vendor_searchable_text(vendors.*);

UPDATE public.events 
SET searchable_text = generate_event_searchable_text(events.*);

-- Function to search packages by vector similarity
CREATE OR REPLACE FUNCTION search_packages_by_embedding(
  query_embedding vector(384),
  match_threshold float DEFAULT 0.5,
  match_count int DEFAULT 10,
  filter_status text DEFAULT 'published'
)
RETURNS TABLE (
  id uuid,
  vendor_id uuid,
  name text,
  description text,
  price_min decimal,
  price_max decimal,
  capacity integer,
  photos text[],
  venue_details jsonb,
  catering_details jsonb,
  entertainment_details jsonb,
  similarity float
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    p.id,
    p.vendor_id,
    p.name,
    p.description,
    p.price_min,
    p.price_max,
    p.capacity,
    p.photos,
    p.venue_details,
    p.catering_details,
    p.entertainment_details,
    1 - (p.embedding <=> query_embedding) as similarity
  FROM public.packages p
  WHERE 
    p.status = filter_status
    AND p.embedding IS NOT NULL
    AND 1 - (p.embedding <=> query_embedding) > match_threshold
  ORDER BY p.embedding <=> query_embedding
  LIMIT match_count;
END;
$$ LANGUAGE plpgsql;

-- Function to search vendors by vector similarity
CREATE OR REPLACE FUNCTION search_vendors_by_embedding(
  query_embedding vector(384),
  match_threshold float DEFAULT 0.5,
  match_count int DEFAULT 10
)
RETURNS TABLE (
  id uuid,
  business_name text,
  description text,
  services text[],
  location_address text,
  location_lat decimal,
  location_lng decimal,
  similarity float
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    v.id,
    v.business_name,
    v.description,
    v.services,
    v.location_address,
    v.location_lat,
    v.location_lng,
    1 - (v.embedding <=> query_embedding) as similarity
  FROM public.vendors v
  WHERE 
    v.status = 'verified'
    AND v.embedding IS NOT NULL
    AND 1 - (v.embedding <=> query_embedding) > match_threshold
  ORDER BY v.embedding <=> query_embedding
  LIMIT match_count;
END;
$$ LANGUAGE plpgsql;

-- Hybrid search: combine vector search with filters
CREATE OR REPLACE FUNCTION search_packages_hybrid(
  query_embedding vector(384),
  min_capacity int DEFAULT NULL,
  max_price decimal DEFAULT NULL,
  service_types text[] DEFAULT NULL,
  match_threshold float DEFAULT 0.5,
  match_count int DEFAULT 10
)
RETURNS TABLE (
  id uuid,
  vendor_id uuid,
  name text,
  description text,
  price_min decimal,
  price_max decimal,
  capacity integer,
  photos text[],
  venue_details jsonb,
  catering_details jsonb,
  entertainment_details jsonb,
  similarity float
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    p.id,
    p.vendor_id,
    p.name,
    p.description,
    p.price_min,
    p.price_max,
    p.capacity,
    p.photos,
    p.venue_details,
    p.catering_details,
    p.entertainment_details,
    1 - (p.embedding <=> query_embedding) as similarity
  FROM public.packages p
  INNER JOIN public.vendors v ON p.vendor_id = v.id
  WHERE 
    p.status = 'published'
    AND v.status = 'verified'
    AND p.embedding IS NOT NULL
    AND 1 - (p.embedding <=> query_embedding) > match_threshold
    AND (min_capacity IS NULL OR p.capacity >= min_capacity)
    AND (max_price IS NULL OR p.price_min <= max_price)
    AND (service_types IS NULL OR v.services && service_types)
  ORDER BY p.embedding <=> query_embedding
  LIMIT match_count;
END;
$$ LANGUAGE plpgsql;



