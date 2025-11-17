# DAM Event Platform

Event management platform connecting planners with vendors through AI-powered search.

## Features

- 🎯 **Smart Package Matching**: AI-powered matching algorithm
- 🔍 **Natural Language Search**: Semantic search using OpenAI embeddings
- 💬 **Real-time Messaging**: Vendor-planner communication
- 📱 **SMS/Email Notifications**: Instant lead notifications
- 🎨 **Modern UI**: Built with Next.js 14 + Tailwind CSS

---

## Natural Language Search (AI-Powered)

### Overview

The platform includes an AI-powered natural language search feature that allows planners to find event packages using conversational queries instead of manual filters.

**Example Queries:**
- "Venues in austin under $3000 for 150 people"
- "Outdoor venue with mediterranean food for 100 guests"
- "Budget-friendly packages downtown for 50 people"

### How It Works

1. **Query Understanding**: GPT-4 extracts structured parameters (budget, capacity, location, food type, etc.) from natural language
2. **Semantic Search**: OpenAI embeddings (text-embedding-3-small) convert queries and packages into 1536-dimensional vectors
3. **Hybrid Matching**: Combines vector similarity with extracted filters for precise results
4. **Ranked Results**: Packages sorted by relevance using cosine similarity

### Architecture

```
User Query → GPT-4 Parameter Extraction → Query Embedding →
PostgreSQL pgvector Similarity Search → Filtered Results
```

### Setup

#### 1. Enable pgvector Extension

Run the migration to enable pgvector and create necessary database functions:

```bash
# Apply the migration (if using Supabase CLI)
supabase db push

# Or run the SQL directly in Supabase SQL Editor:
# supabase/migrations/20250112000000_enable_vector_search.sql
```

#### 2. Configure OpenAI API

Add your OpenAI API key to `.env.local`:

```bash
OPENAI_API_KEY=sk-...
```

#### 3. Generate Embeddings for Existing Packages

Run the backfill script to generate embeddings for all existing packages:

```bash
cd client
npm run backfill-embeddings
```

**Expected Output:**
```
🚀 Starting embedding backfill process...
📦 Found 15 packages needing embeddings
✅ Updated package: Premium Downtown Venue (...)
✅ Successfully embedded: 15 packages
```

#### 4. Test the Feature

1. Navigate to `/planner/browse`
2. Try a natural language query like: "venues in austin for 100 people under $5000"
3. View extracted parameters and semantic search results

### API Endpoints

#### `/api/search/semantic` (POST)

Pure vector similarity search without parameter extraction.

```typescript
// Request
{
  "query": "outdoor wedding venue",
  "limit": 50,  // optional, default: 50
  "threshold": 0.5  // optional, similarity threshold (0-1)
}

// Response
{
  "data": {
    "results": [...],  // Package[]
    "count": 12,
    "query": "outdoor wedding venue",
    "threshold": 0.5
  },
  "error": null
}
```

#### `/api/search/hybrid` (POST)

Vector search + manual filters.

```typescript
// Request
{
  "query": "elegant venue",
  "budget_max": 5000,  // optional
  "capacity_min": 100,  // optional
  "location": "austin"  // optional
}

// Response
{
  "data": {
    "results": [...],
    "count": 8,
    "filters": { budget_max: 5000, capacity_min: 100, location: "austin" }
  },
  "error": null
}
```

#### `/api/search/smart` (POST) - **Recommended**

AI parameter extraction + hybrid search (best results).

```typescript
// Request
{
  "query": "Find me venues in austin under $3000 for 150 people"
}

// Response
{
  "data": {
    "results": [...],
    "count": 5,
    "extractedParams": {
      "budget_max": 3000,
      "capacity_min": 150,
      "location": "austin",
      "food_type": null,
      "event_type": null,
      "venue_type": null
    }
  },
  "error": null
}
```

### Auto-Embedding for New Packages

Embeddings are automatically generated when vendors create or update packages:

- **Create**: `/api/packages` (POST) generates embedding on insert
- **Update**: `/api/packages/[id]` (PUT) regenerates embedding if content changes

### Performance

- **Query Time**: ~200-500ms (including OpenAI API call)
- **Embedding Cost**: ~$0.002 per search (text-embedding-3-small)
- **Index**: HNSW for fast similarity search
- **Caching**: Session-based search history

### Monitoring

Check search analytics in the `search_history` table:

```sql
SELECT
  query,
  extracted_params,
  result_count,
  created_at
FROM search_history
WHERE user_id = 'user-id-here'
ORDER BY created_at DESC
LIMIT 10;
```

### Troubleshooting

**No search results:**
- Check if packages have embeddings: `SELECT COUNT(*) FROM packages WHERE embedding IS NOT NULL;`
- Lower similarity threshold (default: 0.5)
- Run backfill script if embeddings are missing

**Slow queries:**
- Verify HNSW index exists: `\d packages` (look for `packages_embedding_idx`)
- Check OpenAI API status

**Embedding generation fails:**
- Verify `OPENAI_API_KEY` is set
- Check API rate limits
- Review logs for detailed error messages

---