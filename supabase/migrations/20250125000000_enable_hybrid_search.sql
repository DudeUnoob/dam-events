-- Enable Hybrid Search (Vector + Full-Text Search)
-- This migration adds a tsvector column for FTS and updates the search function to combine scores

-- Step 1: Add search_vector column for Full-Text Search
ALTER TABLE packages
ADD COLUMN IF NOT EXISTS search_vector tsvector;

-- Step 2: Create GIN index for fast Full-Text Search
CREATE INDEX IF NOT EXISTS packages_search_vector_idx ON packages USING GIN (search_vector);

-- Step 3: Create function to automatically update search_vector
CREATE OR REPLACE FUNCTION packages_search_vector_update()
RETURNS TRIGGER AS $$
BEGIN
  NEW.search_vector :=
    setweight(to_tsvector('english', COALESCE(NEW.name, '')), 'A') ||
    setweight(to_tsvector('english', COALESCE(NEW.description, '')), 'B') ||
    setweight(to_tsvector('english', COALESCE(NEW.search_description, '')), 'C');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Step 4: Create trigger to update search_vector on insert/update
DROP TRIGGER IF EXISTS packages_search_vector_trigger ON packages;
CREATE TRIGGER packages_search_vector_trigger
BEFORE INSERT OR UPDATE ON packages
FOR EACH ROW
EXECUTE FUNCTION packages_search_vector_update();

-- Step 5: Backfill search_vector for existing rows
UPDATE packages SET search_vector =
  setweight(to_tsvector('english', COALESCE(name, '')), 'A') ||
  setweight(to_tsvector('english', COALESCE(description, '')), 'B') ||
  setweight(to_tsvector('english', COALESCE(search_description, '')), 'C');

-- Step 6: Update hybrid_search_packages to use both Vector and FTS
CREATE OR REPLACE FUNCTION hybrid_search_packages(
  query_embedding vector(1536),
  query_text text DEFAULT '',
  budget_max int DEFAULT NULL,
  capacity_min int DEFAULT NULL,
  location_filter text DEFAULT NULL,
  match_threshold float DEFAULT 0.5,
  match_count int DEFAULT 50,
  fts_weight float DEFAULT 0.3, -- Weight for Full-Text Search (0.0 to 1.0)
  vector_weight float DEFAULT 0.7 -- Weight for Vector Search (0.0 to 1.0)
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
  similarity float,
  fts_score float,
  combined_score float
)
LANGUAGE plpgsql
AS $$
DECLARE
  query_tsquery tsquery;
BEGIN
  -- Convert query text to tsquery for FTS (handling spaces as AND)
  -- Simple conversion: replace spaces with &
  IF query_text IS NOT NULL AND length(query_text) > 0 THEN
    BEGIN
      query_tsquery := plainto_tsquery('english', query_text);
    EXCEPTION WHEN OTHERS THEN
      query_tsquery := to_tsquery('english', '');
    END;
  ELSE
    query_tsquery := to_tsquery('english', '');
  END IF;

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
    (1 - (packages.embedding <=> query_embedding))::float AS similarity,
    (ts_rank(packages.search_vector, query_tsquery) / (1 + ts_rank(packages.search_vector, query_tsquery)))::float AS fts_score, -- Normalize FTS score somewhat
    (
      (1 - (packages.embedding <=> query_embedding)) * vector_weight +
      (ts_rank(packages.search_vector, query_tsquery) / (1 + ts_rank(packages.search_vector, query_tsquery))) * fts_weight
    )::float AS combined_score
  FROM packages
  INNER JOIN vendors ON packages.vendor_id = vendors.id
  WHERE packages.embedding IS NOT NULL
    AND packages.status = 'published'
    -- Apply structured filters
    AND (budget_max IS NULL OR packages.price_min <= budget_max)
    AND (capacity_min IS NULL OR packages.capacity >= capacity_min)
    AND (location_filter IS NULL OR vendors.location_address ILIKE '%' || location_filter || '%')
    -- Combined threshold check (optimization: check vector threshold first as it's usually the primary filter)
    AND (1 - (packages.embedding <=> query_embedding)) > (match_threshold - 0.2) -- Lower threshold slightly to allow FTS to boost
  ORDER BY combined_score DESC
  LIMIT match_count;
END;
$$;
