# RAG System Setup Guide

## Overview
This guide will help you set up and use the RAG (Retrieval-Augmented Generation) system for semantic search in the DAM Events platform. The system uses vector embeddings and pgvector to enable natural language search across packages, vendors, and events.

## Architecture

```
User Query → Embedding Generation → Vector Search → Results
                  ↓                        ↓
            (Xenova/transformers)    (pgvector + Supabase)
```

### Key Components:
1. **Vector Database**: Supabase with pgvector extension
2. **Embedding Model**: `Xenova/all-MiniLM-L6-v2` (384 dimensions)
3. **Search Engine**: Hybrid semantic + filter search
4. **Frontend**: AI Search toggle with natural language input

---

## Step 1: Database Setup

### 1.1 Apply the Migration

Run the migration to add vector support:

```bash
cd supabase
supabase db push
```

Or if using migration files:

```bash
supabase migration up
```

### 1.2 Verify Installation

Connect to your Supabase database and verify:

```sql
-- Check if pgvector extension is installed
SELECT * FROM pg_extension WHERE extname = 'vector';

-- Verify new columns exist
\d packages
\d vendors
\d events

-- Test vector search function
SELECT * FROM search_packages_by_embedding(
  ARRAY[0.1, 0.2, ...]::vector(384),
  0.5,
  10
);
```

---

## Step 2: Generate Initial Embeddings

You need to generate embeddings for existing data in your database.

### Option A: Using the Admin API (Recommended)

1. **Login as Admin** to your application
2. **Navigate to**: `http://localhost:3000/api/admin/embeddings/regenerate`
3. **Make a POST request**:

```bash
# Using curl (replace with your admin auth token)
curl -X POST http://localhost:3000/api/admin/embeddings/regenerate \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"type": "all"}'
```

Or use a tool like Postman/Insomnia.

### Option B: Using a Script

Create a file `scripts/generate-embeddings.ts`:

```typescript
import { createClient } from '@supabase/supabase-js';
import { getEmbedding } from '../client/src/lib/embeddings';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function generateAllEmbeddings() {
  // Generate for packages
  const { data: packages } = await supabase
    .from('packages')
    .select('id, searchable_text');
    
  for (const pkg of packages || []) {
    if (!pkg.searchable_text) continue;
    
    const embedding = await getEmbedding(pkg.searchable_text);
    await supabase
      .from('packages')
      .update({ embedding })
      .eq('id', pkg.id);
      
    console.log(`Generated embedding for package ${pkg.id}`);
  }
}

generateAllEmbeddings().then(() => console.log('Done!'));
```

Run it:
```bash
npx tsx scripts/generate-embeddings.ts
```

---

## Step 3: Configure Environment Variables

Add to your `.env.local`:

```env
# Webhook secret for automatic embedding generation (optional)
WEBHOOK_SECRET=your_random_secret_key_here

# Optional: Use OpenAI instead of Xenova (faster for server-side)
# OPENAI_API_KEY=sk-...

# Optional: Use Hugging Face Inference API
# HUGGINGFACE_API_KEY=hf_...
```

---

## Step 4: Test the System

### 4.1 Test Semantic Search API

```bash
# Search for packages
curl -X POST http://localhost:3000/api/search/packages \
  -H "Content-Type: application/json" \
  -d '{
    "query": "wedding venue with outdoor space for 150 guests",
    "filters": {
      "maxPrice": 50000,
      "minCapacity": 100
    }
  }'
```

Expected response:
```json
{
  "success": true,
  "results": [
    {
      "id": "...",
      "name": "Grand Ballroom Package",
      "similarity": 0.87,
      ...
    }
  ],
  "count": 5
}
```

### 4.2 Test in UI

1. Navigate to `/planner/browse`
2. Click the **"AI Search"** button
3. Try natural language queries:
   - "Wedding venue for 200 guests under $50,000"
   - "Outdoor catering with vegetarian options"
   - "Entertainment for corporate events"

---

## Step 5: Set Up Automatic Embedding Generation

### Option 1: Webhook (Real-time)

Set up a Supabase webhook to automatically generate embeddings when packages are created/updated:

1. Go to Supabase Dashboard → Database → Webhooks
2. Create a new webhook:
   - **Table**: `packages`
   - **Events**: INSERT, UPDATE
   - **Type**: HTTP Request
   - **URL**: `https://your-domain.com/api/webhooks/generate-embeddings`
   - **Headers**: 
     ```json
     {
       "Content-Type": "application/json",
       "x-webhook-secret": "your_webhook_secret"
     }
     ```
   - **Payload**:
     ```json
     {
       "type": "package",
       "record": {
         "id": "{{ record.id }}"
       }
     }
     ```

### Option 2: Cron Job (Batch processing)

Set up a cron job to process embeddings periodically:

```typescript
// app/api/cron/generate-embeddings/route.ts
import { NextResponse } from 'next/server';
import { regenerateAllPackageEmbeddings } from '@/lib/rag/embeddings-server';

export async function GET(request: Request) {
  // Verify cron secret
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  const result = await regenerateAllPackageEmbeddings();
  return NextResponse.json(result);
}
```

Configure in `vercel.json` or your deployment platform:
```json
{
  "crons": [
    {
      "path": "/api/cron/generate-embeddings",
      "schedule": "0 2 * * *"
    }
  ]
}
```

---

## Usage Examples

### Basic Search
```typescript
import { searchPackages } from '@/lib/rag/search-service';

const results = await searchPackages({
  query: "elegant wedding venue with garden"
});
```

### Search with Filters
```typescript
const results = await searchPackages({
  query: "catering service for corporate event",
  filters: {
    maxPrice: 10000,
    minCapacity: 50,
    serviceTypes: ['catering']
  }
});
```

### Search Vendors
```typescript
import { searchVendors } from '@/lib/rag/search-service';

const vendors = await searchVendors(
  "experienced wedding planner in downtown"
);
```

---

## Performance Optimization

### 1. Index Configuration
The migration already creates HNSW indexes for fast vector search:
```sql
CREATE INDEX packages_embedding_idx ON packages 
USING hnsw (embedding vector_cosine_ops);
```

### 2. Adjust Match Threshold
Lower threshold = more results, but less relevant:
```typescript
const results = await searchPackages({
  query: "...",
  matchThreshold: 0.6, // Default is 0.5
  matchCount: 20 // Default is 10
});
```

### 3. Cache Embeddings
The embedding model is cached as a singleton, so subsequent queries are faster.

### 4. Batch Processing
For large datasets, use batch embedding generation:
```typescript
import { getBatchEmbeddings } from '@/lib/embeddings';

const texts = packages.map(p => p.searchable_text);
const embeddings = await getBatchEmbeddings(texts);
```

---

## Troubleshooting

### Issue: "Extension vector does not exist"
**Solution**: Make sure pgvector is installed:
```sql
CREATE EXTENSION IF NOT EXISTS vector;
```

### Issue: Slow embedding generation
**Solutions**:
1. Use OpenAI API instead of local model (faster but costs money)
2. Use Hugging Face Inference API
3. Process embeddings in background/cron job

### Issue: Poor search results
**Solutions**:
1. Lower the `matchThreshold` (e.g., from 0.5 to 0.3)
2. Improve searchable text quality (add more descriptive text)
3. Use hybrid search with filters
4. Check if embeddings are actually generated:
   ```sql
   SELECT COUNT(*) FROM packages WHERE embedding IS NOT NULL;
   ```

### Issue: "Cannot read property 'data' of undefined"
**Solution**: Embedding model not loaded. Check network connection and Hugging Face CDN access.

---

## API Reference

### POST /api/search/packages
Search packages using natural language.

**Request Body**:
```json
{
  "query": "string (required)",
  "filters": {
    "maxPrice": "number (optional)",
    "minCapacity": "number (optional)",
    "serviceTypes": "string[] (optional)"
  },
  "matchThreshold": "number (optional, 0-1)",
  "matchCount": "number (optional)"
}
```

**Response**:
```json
{
  "success": true,
  "results": [
    {
      "id": "uuid",
      "name": "string",
      "description": "string",
      "similarity": "number (0-1)",
      ...
    }
  ],
  "count": "number"
}
```

### POST /api/search/vendors
Search vendors using natural language.

### POST /api/admin/embeddings/regenerate
Regenerate embeddings for all records (admin only).

### POST /api/webhooks/generate-embeddings
Webhook endpoint for automatic embedding generation.

---

## Advanced Configuration

### Using OpenAI Embeddings

For production, you might want to use OpenAI embeddings (faster, more accurate):

1. Install OpenAI SDK:
```bash
npm install openai
```

2. Update `lib/embeddings.ts`:
```typescript
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export async function getEmbedding(text: string): Promise<number[]> {
  const response = await openai.embeddings.create({
    model: "text-embedding-3-small",
    input: text,
  });
  
  return response.data[0].embedding;
}
```

3. Update migration to use 1536 dimensions (OpenAI default):
```sql
ALTER TABLE packages ALTER COLUMN embedding TYPE vector(1536);
```

---

## Monitoring

### Track Search Quality

Add logging to your search API:

```typescript
// app/api/search/packages/route.ts
import { analytics } from '@/lib/analytics';

export async function POST(request: NextRequest) {
  const { query } = await request.json();
  const results = await searchPackages({ query });
  
  // Log search metrics
  analytics.track('semantic_search', {
    query,
    resultCount: results.length,
    avgSimilarity: results.reduce((sum, r) => sum + r.similarity, 0) / results.length
  });
  
  return NextResponse.json({ success: true, results });
}
```

### Monitor Embedding Generation

```sql
-- Check embedding coverage
SELECT 
  COUNT(*) as total,
  COUNT(embedding) as with_embeddings,
  ROUND(100.0 * COUNT(embedding) / COUNT(*), 2) as coverage_pct
FROM packages;
```

---

## Next Steps

1. ✅ Set up database and generate initial embeddings
2. ✅ Test the AI Search feature in the UI
3. ⚡ Set up automatic embedding generation (webhook or cron)
4. 📊 Monitor search quality and adjust thresholds
5. 🚀 Consider upgrading to OpenAI embeddings for production
6. 🎨 Add search analytics and user feedback

---

## FAQ

**Q: How much does vector search cost?**
A: With Xenova (local), it's free. Storage costs are minimal (~1.5KB per 384-dim vector).

**Q: Can I use this for full-text search too?**
A: Yes! You can combine vector similarity with PostgreSQL full-text search for hybrid results.

**Q: How do I handle embeddings for new languages?**
A: The model supports multiple languages. For best results, use a multilingual model like `multilingual-e5-small`.

**Q: What's the search latency?**
A: Typically 50-200ms with HNSW index on thousands of records.

---

## Resources

- [pgvector Documentation](https://github.com/pgvector/pgvector)
- [Transformers.js](https://huggingface.co/docs/transformers.js)
- [Supabase Vector Guide](https://supabase.com/docs/guides/ai/vector-columns)
- [Semantic Search Best Practices](https://www.pinecone.io/learn/semantic-search/)



