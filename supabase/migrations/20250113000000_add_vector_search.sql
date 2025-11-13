-- Add vector search capabilities with pgvector
-- Enables semantic search using OpenAI embeddings

-- Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- Add embedding column to packages table
-- Using 1536 dimensions for OpenAI text-embedding-3-small model
ALTER TABLE public.packages
ADD COLUMN IF NOT EXISTS embedding vector(1536);

-- Create index for fast vector similarity search
-- Using HNSW (Hierarchical Navigable Small World) for better performance
CREATE INDEX IF NOT EXISTS idx_packages_embedding ON public.packages
USING hnsw (embedding vector_cosine_ops)
WITH (m = 16, ef_construction = 64);

-- Function to search packages by semantic similarity
CREATE OR REPLACE FUNCTION search_packages_semantic(
  query_embedding vector(1536),
  match_threshold float DEFAULT 0.5,
  match_count int DEFAULT 20
)
RETURNS TABLE (
  id uuid,
  vendor_id uuid,
  name text,
  description text,
  venue_details jsonb,
  catering_details jsonb,
  entertainment_details jsonb,
  price_min decimal(10, 2),
  price_max decimal(10, 2),
  capacity integer,
  photos text[],
  status text,
  created_at timestamp with time zone,
  updated_at timestamp with time zone,
  similarity float
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    p.id,
    p.vendor_id,
    p.name,
    p.description,
    p.venue_details,
    p.catering_details,
    p.entertainment_details,
    p.price_min,
    p.price_max,
    p.capacity,
    p.photos,
    p.status,
    p.created_at,
    p.updated_at,
    1 - (p.embedding <=> query_embedding) as similarity
  FROM public.packages p
  WHERE p.status = 'published'
    AND p.embedding IS NOT NULL
    AND 1 - (p.embedding <=> query_embedding) > match_threshold
  ORDER BY p.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

-- Function to generate searchable text from package for embedding
CREATE OR REPLACE FUNCTION get_package_searchable_text(package_row public.packages)
RETURNS text
LANGUAGE plpgsql
AS $$
DECLARE
  searchable_text text;
  venue_amenities text[];
  catering_menu text[];
  entertainment_type text;
BEGIN
  -- Extract venue amenities if present
  IF package_row.venue_details IS NOT NULL THEN
    SELECT array_agg(value::text)
    INTO venue_amenities
    FROM jsonb_array_elements_text(package_row.venue_details->'amenities');
  END IF;

  -- Extract catering menu options if present
  IF package_row.catering_details IS NOT NULL THEN
    SELECT array_agg(value::text)
    INTO catering_menu
    FROM jsonb_array_elements_text(package_row.catering_details->'menu_options');
  END IF;

  -- Extract entertainment type if present
  IF package_row.entertainment_details IS NOT NULL THEN
    entertainment_type := package_row.entertainment_details->>'type';
  END IF;

  -- Combine all searchable fields
  searchable_text := package_row.name || ' ' || package_row.description;

  IF venue_amenities IS NOT NULL THEN
    searchable_text := searchable_text || ' amenities: ' || array_to_string(venue_amenities, ', ');
  END IF;

  IF catering_menu IS NOT NULL THEN
    searchable_text := searchable_text || ' menu: ' || array_to_string(catering_menu, ', ');
  END IF;

  IF entertainment_type IS NOT NULL THEN
    searchable_text := searchable_text || ' entertainment: ' || entertainment_type;
  END IF;

  searchable_text := searchable_text || ' capacity: ' || package_row.capacity::text;
  searchable_text := searchable_text || ' price range: $' || package_row.price_min::text || ' to $' || package_row.price_max::text;

  RETURN searchable_text;
END;
$$;

-- Add comment explaining the embedding column
COMMENT ON COLUMN public.packages.embedding IS 'Vector embedding for semantic search using OpenAI text-embedding-3-small (1536 dimensions)';
