-- Fix embedding column dimensions from 384 to 1536
-- This migration corrects the embedding vector dimension to match OpenAI's text-embedding-3-small model

-- Step 1: Drop dependent RPC functions
DROP FUNCTION IF EXISTS match_packages(vector, float, int);
DROP FUNCTION IF EXISTS hybrid_search_packages(vector, int, int, text, float, int);

-- Step 2: Drop the index on embedding column
DROP INDEX IF EXISTS packages_embedding_idx;

-- Step 3: Drop the incorrect embedding column (384 dimensions)
ALTER TABLE packages DROP COLUMN IF EXISTS embedding;

-- Step 4: Add embedding column with correct dimensions (1536)
ALTER TABLE packages
ADD COLUMN embedding vector(1536);

-- Step 5: Recreate HNSW index for fast vector similarity search
CREATE INDEX packages_embedding_idx ON packages
USING hnsw (embedding vector_cosine_ops)
WITH (m = 16, ef_construction = 64);

-- Step 6: Recreate RPC function for pure semantic/vector similarity search
CREATE OR REPLACE FUNCTION match_packages(
  query_embedding vector(1536),
  match_threshold float DEFAULT 0.5,
  match_count int DEFAULT 50
)
RETURNS TABLE (
  id uuid,
  vendor_id uuid,
  name text,
  description text,
  venue_details jsonb,
  catering_details jsonb,
  entertainment_details jsonb,
  price_min numeric,
  price_max numeric,
  capacity integer,
  photos text[],
  status text,
  search_description text,
  similarity float
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    packages.id,
    packages.vendor_id,
    packages.name,
    packages.description,
    packages.venue_details,
    packages.catering_details,
    packages.entertainment_details,
    packages.price_min,
    packages.price_max,
    packages.capacity,
    packages.photos,
    packages.status,
    packages.search_description,
    1 - (packages.embedding <=> query_embedding) AS similarity
  FROM packages
  WHERE packages.embedding IS NOT NULL
    AND packages.status = 'published'
    AND 1 - (packages.embedding <=> query_embedding) > match_threshold
  ORDER BY packages.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

-- Step 7: Recreate RPC function for hybrid search (semantic + structured filters)
CREATE OR REPLACE FUNCTION hybrid_search_packages(
  query_embedding vector(1536),
  budget_max int DEFAULT NULL,
  capacity_min int DEFAULT NULL,
  location_filter text DEFAULT NULL,
  match_threshold float DEFAULT 0.5,
  match_count int DEFAULT 50
)
RETURNS TABLE (
  id uuid,
  vendor_id uuid,
  name text,
  description text,
  venue_details jsonb,
  catering_details jsonb,
  entertainment_details jsonb,
  price_min numeric,
  price_max numeric,
  capacity integer,
  photos text[],
  status text,
  search_description text,
  similarity float
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    packages.id,
    packages.vendor_id,
    packages.name,
    packages.description,
    packages.venue_details,
    packages.catering_details,
    packages.entertainment_details,
    packages.price_min,
    packages.price_max,
    packages.capacity,
    packages.photos,
    packages.status,
    packages.search_description,
    1 - (packages.embedding <=> query_embedding) AS similarity
  FROM packages
  INNER JOIN vendors ON packages.vendor_id = vendors.id
  WHERE packages.embedding IS NOT NULL
    AND packages.status = 'published'
    AND 1 - (packages.embedding <=> query_embedding) > match_threshold
    -- Apply structured filters
    AND (budget_max IS NULL OR packages.price_min <= budget_max)
    AND (capacity_min IS NULL OR packages.capacity >= capacity_min)
    AND (location_filter IS NULL OR vendors.location_address ILIKE '%' || location_filter || '%')
  ORDER BY packages.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

-- Add comment for documentation
COMMENT ON COLUMN packages.embedding IS 'Vector embedding (1536 dims) for semantic search using OpenAI text-embedding-3-small';
