-- Enable pgvector extension for vector similarity search
CREATE EXTENSION IF NOT EXISTS vector;

-- Add embedding column to packages table (1536 dimensions for OpenAI text-embedding-3-small)
ALTER TABLE packages
ADD COLUMN IF NOT EXISTS embedding vector(1536);

-- Add search_description column to store the text that gets embedded
ALTER TABLE packages
ADD COLUMN IF NOT EXISTS search_description TEXT;

-- Create function to generate search description from package data
CREATE OR REPLACE FUNCTION generate_package_search_description(pkg packages)
RETURNS TEXT AS $$
DECLARE
  venue_info TEXT;
  catering_info TEXT;
  entertainment_info TEXT;
BEGIN
  -- Extract venue details from JSONB
  venue_info := COALESCE(
    (pkg.venue_details->>'name') || ' ' ||
    (pkg.venue_details->>'amenities'),
    ''
  );

  -- Extract catering details from JSONB
  catering_info := COALESCE(
    (pkg.catering_details->>'menu_options') || ' ' ||
    (pkg.catering_details->>'dietary_accommodations'),
    ''
  );

  -- Extract entertainment details from JSONB
  entertainment_info := COALESCE(
    (pkg.entertainment_details->>'type') || ' ' ||
    (pkg.entertainment_details->>'equipment'),
    ''
  );

  -- Combine all searchable content
  RETURN pkg.name || ' ' ||
         COALESCE(pkg.description, '') || ' ' ||
         venue_info || ' ' ||
         catering_info || ' ' ||
         entertainment_info || ' ' ||
         'capacity ' || pkg.capacity || ' people ' ||
         'price range $' || pkg.price_min || ' to $' || pkg.price_max;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Create trigger function to auto-update search_description
CREATE OR REPLACE FUNCTION trigger_update_search_description()
RETURNS TRIGGER AS $$
BEGIN
  -- Update search_description whenever package is inserted or updated
  NEW.search_description := generate_package_search_description(NEW);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-generate search descriptions
DROP TRIGGER IF EXISTS packages_search_description_trigger ON packages;
CREATE TRIGGER packages_search_description_trigger
BEFORE INSERT OR UPDATE ON packages
FOR EACH ROW
EXECUTE FUNCTION trigger_update_search_description();

-- Create HNSW index for fast vector similarity search
-- Using HNSW instead of IVFFlat for better accuracy (good for <100k packages)
CREATE INDEX IF NOT EXISTS packages_embedding_idx ON packages
USING hnsw (embedding vector_cosine_ops)
WITH (m = 16, ef_construction = 64);

-- Drop existing function if it exists (to handle signature changes)
DROP FUNCTION IF EXISTS match_packages(vector, float, int);
DROP FUNCTION IF EXISTS match_packages(vector, double precision, integer);

-- Create RPC function for pure semantic/vector similarity search
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
  price_min integer,
  price_max integer,
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

-- Drop existing function if it exists (to handle signature changes)
DROP FUNCTION IF EXISTS hybrid_search_packages(vector, int, int, text, float, int);
DROP FUNCTION IF EXISTS hybrid_search_packages(vector, integer, integer, text, double precision, integer);

-- Create RPC function for hybrid search (semantic + structured filters)
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
  price_min integer,
  price_max integer,
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

-- Create optional search_history table for analytics (P1 requirement)
CREATE TABLE IF NOT EXISTS search_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  query TEXT NOT NULL,
  extracted_params JSONB,
  result_count INTEGER,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_search_history_user ON search_history(user_id);
CREATE INDEX IF NOT EXISTS idx_search_history_created ON search_history(created_at DESC);

-- Add comment for documentation
COMMENT ON COLUMN packages.embedding IS 'Vector embedding (1536 dims) for semantic search using OpenAI text-embedding-3-small';
COMMENT ON COLUMN packages.search_description IS 'Combined searchable text used to generate embeddings';
COMMENT ON FUNCTION match_packages IS 'Performs pure vector similarity search on packages';
COMMENT ON FUNCTION hybrid_search_packages IS 'Combines vector similarity with structured filters (budget, capacity, location)';
