# Semantic Search with OpenAI and pgvector

This document explains the AI-powered natural language search functionality for the DAM Event Platform.

## Overview

The platform now supports **semantic search** using OpenAI embeddings and PostgreSQL's pgvector extension. This allows users to search for event packages using natural language queries like:

- "Wedding venue with outdoor ceremony space for 200 guests"
- "Luxury ballroom under $10,000 with catering"
- "Corporate event space with AV equipment for 50-100 people"

## Architecture

### Components

1. **pgvector Extension** - PostgreSQL extension for vector similarity search
2. **OpenAI Embeddings API** - Converts text to 1536-dimensional vectors
3. **Semantic Search API** - `/api/packages/search` endpoint
4. **Browse Page** - Updated with AI search toggle and natural language input
5. **Embeddings Generation Script** - Batch generates embeddings for existing packages

### How It Works

1. **Package Creation/Update**: When a package is created or updated, its searchable content (name, description, amenities, etc.) is converted to a vector embedding using OpenAI's `text-embedding-3-small` model
2. **Search Query**: User enters a natural language search query
3. **Query Embedding**: The query is converted to a vector using the same model
4. **Vector Similarity**: PostgreSQL uses cosine similarity to find packages with similar embeddings
5. **Results**: Packages are returned ranked by similarity score

## Setup Instructions

### 1. Environment Variables

Add the following to your `.env.local` file:

```bash
# OpenAI API Key (required for semantic search)
OPENAI_API_KEY=sk-your-openai-api-key-here

# Supabase (already configured)
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key  # For scripts
```

Get your OpenAI API key from: https://platform.openai.com/api-keys

### 2. Database Migration

Run the migration to enable pgvector and add embedding columns:

```bash
# Using Supabase CLI
supabase db push

# Or manually run the migration
psql -h your-db-host -U postgres -d postgres -f supabase/migrations/20250113000000_add_vector_search.sql
```

This will:
- Enable the `vector` extension
- Add an `embedding` column to the `packages` table
- Create an HNSW index for fast similarity search
- Add utility functions for semantic search

### 3. Generate Embeddings for Existing Packages

After running the migration, generate embeddings for all existing packages:

```bash
# Install tsx if not already installed
npm install -D tsx

# Run the embeddings generation script
npx tsx scripts/generate-embeddings.ts
```

This script will:
- Fetch all published packages without embeddings
- Generate embeddings in batches of 100
- Update the database with the embeddings
- Show progress and summary

### 4. Automatic Embedding Generation (Future Enhancement)

Currently, embeddings need to be manually generated when packages are created/updated. To make this automatic:

**Option A: Database Trigger (Recommended)**
Create a PostgreSQL function that calls your API when a package is inserted/updated.

**Option B: Application Hook**
Update the package creation/update API to generate embeddings automatically:

```typescript
// In /api/packages/route.ts (POST/PUT handlers)
import { generateEmbedding, createPackageSearchText } from '@/lib/openai/embeddings';

// After creating/updating package
const searchText = createPackageSearchText(packageData);
const embedding = await generateEmbedding(searchText);

await supabase
  .from('packages')
  .update({ embedding })
  .eq('id', packageId);
```

## Usage

### User Interface

1. **Toggle AI Search**: Click the "AI Search" button to enable semantic search
2. **Enter Query**: Type a natural language query describing what you're looking for
3. **View Results**: Results are ranked by semantic similarity, not just keyword matching

### Search Examples

**Good Queries:**
- "Outdoor wedding venue for 150 guests under $5000"
- "Corporate event space with projector and sound system"
- "Birthday party venue with catering for 50 kids"
- "Elegant ballroom with chandeliers and dance floor"
- "Budget-friendly venue with parking near downtown"

**Traditional vs Semantic Search:**

| Traditional Search | Semantic Search |
|-------------------|-----------------|
| Keyword matching only | Understands context and intent |
| "venue" finds "venue" | "venue" also finds "space", "location", "hall" |
| No typo tolerance | Some typo tolerance |
| No number understanding | Understands "100 guests" = capacity |
| No price understanding | Understands "under $5000" = budget |

## API Reference

### Search Endpoint

```
GET /api/packages/search?q=<query>&threshold=<float>&limit=<int>
```

**Parameters:**
- `q` (required): Natural language search query
- `threshold` (optional): Minimum similarity score (0-1, default: 0.5)
- `limit` (optional): Maximum results (default: 20)

**Response:**
```json
{
  "packages": [
    {
      "id": "uuid",
      "name": "Package name",
      "description": "...",
      "similarity": 0.87,
      "vendor": { ... },
      ...
    }
  ],
  "count": 10,
  "query": "original query"
}
```

### Generate Embedding Endpoint

```
POST /api/packages/search
Content-Type: application/json

{
  "packageId": "uuid",
  "searchText": "searchable text content"
}
```

## Performance

### Indexing

The HNSW index provides excellent performance for similarity search:
- Query time: ~10-50ms for 10,000 packages
- Scalability: Up to millions of vectors

### Index Parameters

```sql
CREATE INDEX idx_packages_embedding ON packages
USING hnsw (embedding vector_cosine_ops)
WITH (m = 16, ef_construction = 64);
```

- `m = 16`: Number of bi-directional links (higher = more accurate, slower inserts)
- `ef_construction = 64`: Size of dynamic candidate list (higher = better quality index, slower inserts)

### Cost Optimization

**OpenAI Embedding Costs:**
- Model: `text-embedding-3-small`
- Cost: $0.00002 per 1,000 tokens
- Average package: ~200 tokens = $0.000004 per embedding
- 10,000 packages: ~$0.04

**Cost Reduction:**
1. Cache embeddings in database (already implemented)
2. Only regenerate when package content changes
3. Use batch API for multiple embeddings
4. Consider using smaller models for non-critical searches

## Troubleshooting

### Error: "pgvector extension not found"

Make sure you've run the migration:
```bash
supabase db push
```

Or manually enable the extension:
```sql
CREATE EXTENSION IF NOT EXISTS vector;
```

### Error: "OPENAI_API_KEY not found"

Add your OpenAI API key to `.env.local`:
```bash
OPENAI_API_KEY=sk-...
```

### Low Quality Results

1. **Adjust similarity threshold**: Lower threshold = more results
   ```
   /api/packages/search?q=wedding&threshold=0.3
   ```

2. **Regenerate embeddings**: Old embeddings may be outdated
   ```bash
   npx tsx scripts/generate-embeddings.ts
   ```

3. **Improve package descriptions**: Better descriptions = better embeddings

### Slow Search

1. **Check index**: Ensure HNSW index is created
   ```sql
   \d packages  -- Should show idx_packages_embedding
   ```

2. **Increase index parameters**: Better performance but slower inserts
   ```sql
   DROP INDEX idx_packages_embedding;
   CREATE INDEX idx_packages_embedding ON packages
   USING hnsw (embedding vector_cosine_ops)
   WITH (m = 32, ef_construction = 128);
   ```

## Future Enhancements

1. **Hybrid Search**: Combine semantic search with traditional filters
2. **Query Expansion**: Automatically expand queries with synonyms
3. **Personalization**: Learn from user behavior to improve results
4. **Multi-modal Search**: Search by images, not just text
5. **Real-time Embedding**: Generate embeddings on package creation
6. **Analytics**: Track search queries and improve matching

## Technical Details

### Embedding Model

- **Model**: `text-embedding-3-small`
- **Dimensions**: 1536
- **Max Tokens**: 8191
- **Output**: Float array (cosine normalized)

### Similarity Metric

```
Cosine Similarity = 1 - (embedding1 <=> embedding2)
```

Where `<=>` is the cosine distance operator in pgvector.

### Database Function

```sql
-- Main search function
search_packages_semantic(
  query_embedding vector(1536),
  match_threshold float,
  match_count int
)
```

### Searchable Text Generation

The `createPackageSearchText` function combines:
- Package name and description
- Venue name and amenities
- Catering menu and dietary options
- Entertainment type and equipment
- Capacity and price range

## Resources

- [OpenAI Embeddings Guide](https://platform.openai.com/docs/guides/embeddings)
- [pgvector Documentation](https://github.com/pgvector/pgvector)
- [Supabase Vector Guide](https://supabase.com/docs/guides/ai/vector-columns)
- [HNSW Algorithm](https://arxiv.org/abs/1603.09320)
