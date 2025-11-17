# Natural Language Search Feature Specification
## DAM Event Platform - Planner Enhancement

---

## Feature Overview

**Feature Name:** Natural Language Package Search

**Priority:** P1 (Post-MVP Enhancement)

**User Type:** Planners

**Description:** Allow planners to search for event packages using conversational, natural language queries instead of manually adjusting multiple filters. The system will parse the query, extract key parameters (location, budget, capacity, food type, event type, etc.), and return relevant packages.

---

## Problem Statement

**Current State:**
- Planners must manually adjust 5-7 separate filters (budget slider, location dropdown, capacity input, etc.)
- Users may not know which filters to adjust or what options are available
- Multi-criteria searches require multiple clicks and form interactions
- Mobile users find filter interfaces cumbersome

**Desired State:**
- Planners can express their requirements naturally in one search bar
- System intelligently extracts parameters and returns relevant results
- Faster, more intuitive search experience
- Reduces cognitive load of understanding filter structure

---

## User Stories

**Epic: Natural Language Search**

**US-NLS-001:** As a planner, I want to search for packages using natural language so that I can find what I need faster than using multiple filters.

**US-NLS-002:** As a planner, I want the search to understand common event planning terms (e.g., "mediterranean food," "outdoor venue," "live band") so that I don't need to learn platform-specific terminology.

**US-NLS-003:** As a planner, I want to see which parameters were extracted from my search so that I can verify the system understood my query correctly.

**US-NLS-004:** As a planner, I want to edit or refine my search query if results aren't what I expected so that I can quickly iterate.

**US-NLS-005:** As a planner, I want the search to work even if I don't specify all parameters (e.g., just "venues in austin" or "under $3000") so that I have flexibility in how I search.

**US-NLS-006:** As a planner, I want the search to handle typos and variations (e.g., "Austin" vs "austin," "150 ppl" vs "150 people") so that I don't have to be precise with formatting.

---

## Functional Requirements

### **FR-NLS-001: Natural Language Query Input**

**Description:** Provide a prominent search bar that accepts natural language queries.

**Acceptance Criteria:**
- Search bar is visible on `/planner/browse` page
- Minimum character length: 10 characters (to ensure meaningful queries)
- Maximum character length: 500 characters
- Real-time character counter displayed
- Search triggers on "Enter" key or "Search" button click
- Loading state displayed while processing query

**Example Queries:**
- "Find me venues in austin that offer mediterranean food to fit 150 people at a max budget of $3000"
- "Outdoor venue near campus under $2000"
- "Need catering for 200 people, italian food preferred"
- "Venues with live music options in downtown area"
- "Budget-friendly packages for 50-75 guests"

---

### **FR-NLS-002: Query Parsing & Parameter Extraction**

**Description:** Parse natural language query and extract structured search parameters.

**Parameters to Extract:**

| Parameter | Examples | Required |
|-----------|----------|----------|
| **Location** | "austin", "downtown", "near campus", "within 5 miles of UT" | No |
| **Budget** | "$3000", "under $3000", "max budget $3k", "between $2000-$4000" | No |
| **Capacity** | "150 people", "50-75 guests", "100 attendees" | No |
| **Food Type** | "mediterranean", "italian", "vegan options", "bbq" | No |
| **Event Type** | "formal", "mixer", "networking", "birthday" | No |
| **Venue Type** | "outdoor", "indoor", "rooftop", "garden" | No |
| **Services** | "DJ", "live band", "photographer", "bar service" | No |
| **Amenities** | "parking", "ADA accessible", "wifi", "projector" | No |

**Acceptance Criteria:**
- System must extract at least 1 parameter from query
- System handles multiple parameters in single query
- System normalizes variations (e.g., "100 ppl" → 100 capacity)
- System handles range queries (e.g., "50-75 guests" → min: 50, max: 75)
- System extracts budget as numeric value in dollars
- System maps location to coordinates or city names in database

**Edge Cases:**
- Query with no extractable parameters → return error message with examples
- Ambiguous queries → use best guess and show "Did you mean?" suggestions
- Multiple conflicting parameters (e.g., "under $1000 and over $5000") → use most recent/specific parameter

---

### **FR-NLS-003: Search Results Display**

**Description:** Display packages matching extracted parameters with transparency about what was understood.

**Acceptance Criteria:**
- Show "Search Results for:" header with extracted parameters as tags
- Example: "Search Results for: **Austin** · **$3000 max** · **150 people** · **Mediterranean**"
- Each tag is removable (click X to remove that filter)
- Results are ranked by relevance (exact matches first, partial matches second)
- Show result count (e.g., "24 packages found")
- If no results, show "0 packages found" with suggestions to broaden search
- Maintain standard package card layout from browse page

**Relevance Scoring Logic:**
```
Score = 0
IF location matches exactly: +10 points
IF within budget: +8 points  
IF capacity fits (guest_count <= package.max_capacity): +8 points
IF food type matches: +5 points
IF event type matches: +3 points
IF venue type matches: +3 points
IF additional services match: +2 points each

Sort by: Score DESC, then Price ASC
```

---

### **FR-NLS-004: Query Refinement**

**Description:** Allow planners to refine their search after seeing initial results.

**Acceptance Criteria:**
- Search bar remains visible at top of results page
- Previous query is pre-populated in search bar
- Clicking a parameter tag removes that filter and updates results
- "Clear all filters" button returns to default browse view
- "Use traditional filters" link switches to filter sidebar interface
- Search history saved in session (last 3 searches accessible via dropdown)

---

### **FR-NLS-005: Fallback Behavior**

**Description:** Gracefully handle queries that can't be parsed or return no results.

**Acceptance Criteria:**
- If no parameters extracted: Show error message: 
  - *"We couldn't understand your search. Try something like: 'venues in Austin under $3000 for 100 guests'"*
- If parameters extracted but 0 results: Show message:
  - *"No packages match your search. Try broadening your criteria:"*
  - Suggest removing most restrictive filter (e.g., "Remove $3000 budget limit")
- Offer "Browse all packages" button as escape hatch

---

## Technical Implementation

### **Architecture Overview - Vector-Based Semantic Search**

```
User Query → Generate Embedding → Vector Similarity Search (pgvector) → 
Optional Structured Filters → Ranked Results
```

**Why Vector Search?**
- Understands semantic meaning, not just keywords ("affordable venue" = "budget-friendly space")
- Handles typos and variations naturally
- No need to maintain extensive keyword lists
- Scales well with database growth
- Can combine with traditional filters for hybrid search

---

### **Step 1: Enable pgvector Extension in Supabase**

```sql
-- Run in Supabase SQL Editor
CREATE EXTENSION IF NOT EXISTS vector;
```

---

### **Step 2: Database Schema Modifications**

**Add embedding column to packages table:**

```sql
-- Add vector column to store embeddings (1536 dimensions for OpenAI text-embedding-3-small)
ALTER TABLE packages 
ADD COLUMN embedding vector(1536);

-- Create index for fast similarity search
CREATE INDEX ON packages 
USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 100);

-- Alternative: HNSW index (better accuracy, more storage)
-- CREATE INDEX ON packages 
-- USING hnsw (embedding vector_cosine_ops);
```

**Create search_description field (what gets embedded):**

```sql
-- Add a computed/stored description field that combines all searchable content
ALTER TABLE packages 
ADD COLUMN search_description TEXT;

-- Function to generate search description
CREATE OR REPLACE FUNCTION generate_package_search_description(pkg packages)
RETURNS TEXT AS $$
BEGIN
  RETURN pkg.name || ' ' ||
         pkg.description || ' ' ||
         pkg.venue_name || ' ' ||
         COALESCE(pkg.location, '') || ' ' ||
         COALESCE(array_to_string(pkg.cuisine_types, ' '), '') || ' ' ||
         COALESCE(pkg.venue_type, '') || ' ' ||
         COALESCE(array_to_string(pkg.services_included, ' '), '') || ' ' ||
         'capacity ' || pkg.max_capacity || ' people ' ||
         'price range $' || pkg.price_min || ' to $' || pkg.price_max;
END;
$$ LANGUAGE plpgsql;
```

---

### **Step 3: Generate Embeddings for Existing Packages**

**Option A: Using OpenAI Embeddings (Recommended)**

```typescript
// /lib/embeddings.ts

import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function generateEmbedding(text: string): Promise<number[]> {
  const response = await openai.embeddings.create({
    model: 'text-embedding-3-small', // 1536 dimensions, fast and cheap
    input: text,
  });

  return response.data[0].embedding;
}

// Alternative: Use text-embedding-3-large for better accuracy (3072 dimensions)
// Would require updating vector column: ALTER TABLE packages ALTER COLUMN embedding TYPE vector(3072);
```

**Cost Analysis:**
- `text-embedding-3-small`: $0.02 per 1M tokens (~4M characters)
- For 1000 packages with 200-word descriptions: ~$0.10
- Query embeddings: ~$0.002 per 1000 searches

**Option B: Using Voyage AI (Alternative, optimized for search)**

```typescript
import { VoyageAIClient } from 'voyageai';

const voyageClient = new VoyageAIClient({
  apiKey: process.env.VOYAGE_API_KEY,
});

export async function generateEmbedding(text: string): Promise<number[]> {
  const response = await voyageClient.embed({
    input: [text],
    model: 'voyage-2', // 1024 dimensions
  });

  return response.embeddings[0];
}
```

---

### **Step 4: Backfill Embeddings for Existing Packages**

```typescript
// /scripts/backfill-embeddings.ts

import { createClient } from '@supabase/supabase-js';
import { generateEmbedding } from '@/lib/embeddings';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // Use service role for admin operations
);

async function backfillEmbeddings() {
  // Fetch all packages without embeddings
  const { data: packages, error } = await supabase
    .from('packages')
    .select('*')
    .is('embedding', null);

  if (error) throw error;

  console.log(`Backfilling ${packages.length} packages...`);

  for (const pkg of packages) {
    // Generate search description
    const searchDescription = `
      ${pkg.name} 
      ${pkg.description} 
      ${pkg.venue_name} 
      Located in ${pkg.location} 
      ${pkg.cuisine_types?.join(' ')} cuisine
      ${pkg.venue_type} venue
      Services: ${pkg.services_included?.join(', ')}
      Capacity: ${pkg.max_capacity} people
      Price: $${pkg.price_min} - $${pkg.price_max}
    `.trim();

    // Generate embedding
    const embedding = await generateEmbedding(searchDescription);

    // Update package with embedding
    const { error: updateError } = await supabase
      .from('packages')
      .update({ 
        embedding,
        search_description: searchDescription 
      })
      .eq('id', pkg.id);

    if (updateError) {
      console.error(`Error updating package ${pkg.id}:`, updateError);
    } else {
      console.log(`✓ Updated package ${pkg.id}`);
    }

    // Rate limiting: wait 100ms between API calls
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  console.log('Backfill complete!');
}

backfillEmbeddings();
```

**Run backfill:**
```bash
npm run backfill-embeddings
```

---

### **Step 5: Trigger for New Packages (Auto-generate embeddings)**

```sql
-- Create function to auto-generate embeddings on insert/update
CREATE OR REPLACE FUNCTION trigger_generate_embedding()
RETURNS TRIGGER AS $$
BEGIN
  -- Update search_description
  NEW.search_description := generate_package_search_description(NEW);
  
  -- Note: Embedding generation happens in application code via Edge Function
  -- This trigger just ensures search_description is updated
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Attach trigger
CREATE TRIGGER packages_search_description_trigger
BEFORE INSERT OR UPDATE ON packages
FOR EACH ROW
EXECUTE FUNCTION trigger_generate_embedding();
```

**Handle embedding generation in application:**

```typescript
// /app/api/packages/create/route.ts

export async function POST(request: Request) {
  const packageData = await request.json();

  // Generate search description
  const searchDescription = `
    ${packageData.name}
    ${packageData.description}
    ${packageData.venue_name}
    Located in ${packageData.location}
    ...
  `.trim();

  // Generate embedding
  const embedding = await generateEmbedding(searchDescription);

  // Insert package with embedding
  const { data, error } = await supabase
    .from('packages')
    .insert({
      ...packageData,
      search_description: searchDescription,
      embedding,
    })
    .select()
    .single();

  return Response.json({ data, error });
}
```

---

### **Step 6: Implement Vector Similarity Search**

```typescript
// /app/api/search/semantic/route.ts

import { createClient } from '@supabase/supabase-js';
import { generateEmbedding } from '@/lib/embeddings';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_ANON_KEY!
);

export async function POST(request: Request) {
  const { query } = await request.json();

  // Step 1: Generate embedding for user query
  const queryEmbedding = await generateEmbedding(query);

  // Step 2: Perform vector similarity search
  const { data: packages, error } = await supabase
    .rpc('match_packages', {
      query_embedding: queryEmbedding,
      match_threshold: 0.5, // Cosine similarity threshold (0-1)
      match_count: 50, // Max results to return
    });

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  return Response.json({
    results: packages,
    count: packages?.length || 0,
    query: query,
  });
}
```

**Create RPC function for vector search:**

```sql
-- Create function for vector similarity search
CREATE OR REPLACE FUNCTION match_packages(
  query_embedding vector(1536),
  match_threshold float DEFAULT 0.5,
  match_count int DEFAULT 50
)
RETURNS TABLE (
  id uuid,
  name text,
  description text,
  location text,
  price_min integer,
  price_max integer,
  max_capacity integer,
  cuisine_types text[],
  venue_type text,
  similarity float
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    packages.id,
    packages.name,
    packages.description,
    packages.location,
    packages.price_min,
    packages.price_max,
    packages.max_capacity,
    packages.cuisine_types,
    packages.venue_type,
    1 - (packages.embedding <=> query_embedding) AS similarity
  FROM packages
  WHERE packages.embedding IS NOT NULL
    AND packages.is_active = true
    AND 1 - (packages.embedding <=> query_embedding) > match_threshold
  ORDER BY packages.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;
```

---

### **Step 7: Hybrid Search (Semantic + Structured Filters)**

Combine vector search with traditional filters for best results:

```typescript
// /app/api/search/hybrid/route.ts

export async function POST(request: Request) {
  const { 
    query, 
    budget_max, 
    capacity_min, 
    location 
  } = await request.json();

  // Generate embedding for semantic search
  const queryEmbedding = await generateEmbedding(query);

  // Hybrid search: vector similarity + structured filters
  const { data: packages, error } = await supabase
    .rpc('hybrid_search_packages', {
      query_embedding: queryEmbedding,
      budget_max: budget_max,
      capacity_min: capacity_min,
      location_filter: location,
      match_threshold: 0.5,
      match_count: 50,
    });

  return Response.json({ results: packages });
}
```

**SQL function for hybrid search:**

```sql
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
  name text,
  description text,
  location text,
  price_min integer,
  price_max integer,
  max_capacity integer,
  similarity float
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    packages.id,
    packages.name,
    packages.description,
    packages.location,
    packages.price_min,
    packages.price_max,
    packages.max_capacity,
    1 - (packages.embedding <=> query_embedding) AS similarity
  FROM packages
  WHERE packages.embedding IS NOT NULL
    AND packages.is_active = true
    AND 1 - (packages.embedding <=> query_embedding) > match_threshold
    -- Apply structured filters
    AND (budget_max IS NULL OR packages.price_min <= budget_max)
    AND (capacity_min IS NULL OR packages.max_capacity >= capacity_min)
    AND (location_filter IS NULL OR packages.location ILIKE '%' || location_filter || '%')
  ORDER BY packages.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;
```

---

### **Step 8: Smart Parameter Extraction + Vector Search**

Use LLM to extract structured parameters, then apply them as filters:

```typescript
// /app/api/search/smart/route.ts

import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function POST(request: Request) {
  const { query } = await request.json();

  // Step 1: Extract structured parameters using Claude
  const extractionPrompt = `Extract structured search parameters from this event planning query.

Query: "${query}"

Return ONLY valid JSON with these fields (use null if not mentioned):
{
  "budget_max": number or null,
  "capacity_min": number or null,
  "location": string or null
}`;

  const message = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 200,
    messages: [{ role: 'user', content: extractionPrompt }],
  });

  const responseText = message.content[0].text;
  const jsonMatch = responseText.match(/\{[\s\S]*\}/);
  const extractedParams = jsonMatch ? JSON.parse(jsonMatch[0]) : {};

  // Step 2: Generate embedding for semantic search
  const queryEmbedding = await generateEmbedding(query);

  // Step 3: Hybrid search with extracted parameters
  const { data: packages } = await supabase.rpc('hybrid_search_packages', {
    query_embedding: queryEmbedding,
    budget_max: extractedParams.budget_max,
    capacity_min: extractedParams.capacity_min,
    location_filter: extractedParams.location,
    match_threshold: 0.5,
    match_count: 50,
  });

  return Response.json({
    results: packages,
    extractedParams,
    query,
  });
}
```

**This approach gives you:**
- Semantic understanding ("affordable" matches low-priced packages)
- Precise filtering on budget/capacity/location
- Best of both worlds

---

### **Performance Optimization**

**1. Index Tuning:**
```sql
-- For small datasets (<10k packages): IVFFlat
CREATE INDEX ON packages 
USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 100);

-- For larger datasets: HNSW (better accuracy, more memory)
CREATE INDEX ON packages 
USING hnsw (embedding vector_cosine_ops)
WITH (m = 16, ef_construction = 64);
```

**2. Caching Strategy:**
```typescript
// Cache popular queries using Redis or Upstash
import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

export async function POST(request: Request) {
  const { query } = await request.json();
  
  // Check cache
  const cacheKey = `search:${query.toLowerCase().trim()}`;
  const cached = await redis.get(cacheKey);
  
  if (cached) {
    return Response.json({ results: cached, cached: true });
  }

  // Perform search...
  const queryEmbedding = await generateEmbedding(query);
  const { data: packages } = await supabase.rpc('match_packages', {
    query_embedding: queryEmbedding,
  });

  // Cache for 1 hour
  await redis.set(cacheKey, packages, { ex: 3600 });

  return Response.json({ results: packages, cached: false });
}
```

**3. Batch Embedding Generation:**
```typescript
// Generate embeddings in batches for efficiency
export async function generateEmbeddingsBatch(texts: string[]): Promise<number[][]> {
  const response = await openai.embeddings.create({
    model: 'text-embedding-3-small',
    input: texts, // Pass array of texts
  });

  return response.data.map(item => item.embedding);
}
```

---

### **Embedding Model Comparison**

| Model | Provider | Dimensions | Cost (per 1M tokens) | Best For | Notes |
|-------|----------|------------|---------------------|----------|-------|
| **text-embedding-3-small** | OpenAI | 1536 | $0.02 | General search, cost-sensitive | ✅ Recommended for MVP |
| **text-embedding-3-large** | OpenAI | 3072 | $0.13 | High accuracy needs | Better quality, 6.5x more expensive |
| **text-embedding-ada-002** | OpenAI | 1536 | $0.10 | Legacy | Older model, not recommended |
| **voyage-2** | Voyage AI | 1024 | $0.10 | Search-optimized | Specialized for retrieval |
| **cohere-embed-v3** | Cohere | 1024 | $0.10 | Multilingual | Good for non-English |
| **all-MiniLM-L6-v2** | Open Source | 384 | Free | Self-hosted | Requires GPU, lower quality |

**Recommendation:**
- **MVP:** Use OpenAI `text-embedding-3-small` (best balance of cost/quality)
- **Post-MVP:** A/B test `text-embedding-3-large` on a subset of queries
- **Long-term:** Consider self-hosted models if costs become significant

### **Choosing Vector Dimensions**

```sql
-- Option 1: Full dimensions (better accuracy)
ALTER TABLE packages ADD COLUMN embedding vector(1536);

-- Option 2: Reduced dimensions (better performance, lower storage)
-- OpenAI allows specifying dimensions parameter
ALTER TABLE packages ADD COLUMN embedding vector(768);

-- Generate with reduced dimensions
const response = await openai.embeddings.create({
  model: 'text-embedding-3-small',
  input: text,
  dimensions: 768  // Reduce from 1536 to 768
});
```

**Trade-offs:**
- More dimensions = Better accuracy, slower search, more storage
- Fewer dimensions = Faster search, less storage, slightly lower accuracy
- For 1000 packages: 1536 dims = 6MB, 768 dims = 3MB

---

### **Advanced: Two-Stage Search with Reranking**

For maximum search quality, use a two-stage approach:

**Stage 1: Fast Vector Search (Cast Wide Net)**
```typescript
// Get top 100 candidates using vector search
const { data: candidates } = await supabase.rpc('match_packages', {
  query_embedding: queryEmbedding,
  match_threshold: 0.3,  // Lower threshold
  match_count: 100,  // More candidates
});
```

**Stage 2: LLM Reranking (Precise Ranking)**
```typescript
// Use Claude to rerank top candidates based on query intent
const rerankPrompt = `Given this search query: "${query}"

Rank these 10 packages by relevance (1 = most relevant):

${candidates.slice(0, 10).map((pkg, i) => `
${i + 1}. ${pkg.name}
   ${pkg.description}
   Location: ${pkg.location}
   Price: $${pkg.price_min}-${pkg.price_max}
   Capacity: ${pkg.max_capacity}
`).join('\n')}

Respond with ONLY a JSON array of package IDs in ranked order:
["pkg-id-1", "pkg-id-2", ...]`;

const message = await anthropic.messages.create({
  model: 'claude-sonnet-4-20250514',
  max_tokens: 500,
  messages: [{ role: 'user', content: rerankPrompt }]
});

const responseText = message.content[0].text;
const jsonMatch = responseText.match(/\[[\s\S]*\]/);
const rerankedIds = jsonMatch ? JSON.parse(jsonMatch[0]) : [];

// Return packages in reranked order
const finalResults = rerankedIds.map(id => 
  candidates.find(pkg => pkg.id === id)
);
```

**Why This Works:**
- Vector search is fast but sometimes misses nuance (e.g., "romantic" might not match "intimate ambiance")
- LLM reranking captures intent better and understands context
- Only rerank top 10-20 to control costs (most users only see first page)
- Best of both: speed of vectors + intelligence of LLMs

**Cost Comparison:**
- Vector-only search: ~$0.002 per search
- Vector + reranking: ~$0.012 per search
- Worth it for complex queries or premium users

**When to Use Reranking:**
- User indicates search isn't giving good results (thumbs down)
- Premium/paid features where quality matters most
- Complex queries with multiple criteria
- After initial vector search returns >20 results

---

## UI/UX Specifications

### **Search Bar Component**

**Location:** Top of `/planner/browse` page, above filter sidebar

**Layout:**
```
┌─────────────────────────────────────────────────────────────┐
│  🔍  Describe your event...                          [Search]│
│      "austin venues under $3000 for 150 people"             │
└─────────────────────────────────────────────────────────────┘
```

**States:**
- **Empty:** Placeholder text with example query
- **Focused:** Show search history dropdown (last 3 searches)
- **Loading:** Show spinner, disable input
- **Error:** Red border, error message below
- **Success:** Green checkmark, extracted parameters shown as tags

### **Results Display**

```
┌──────────────────────────────────────────────────────┐
│ Search Results for:                                  │
│  ✕ Austin    ✕ $3000 max    ✕ 150 people    ✕ Mediterranean │
│                                    [Clear all filters]│
│                                                      │
│  24 packages found                                   │
│                                                      │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐ │
│  │  Package 1  │  │  Package 2  │  │  Package 3  │ │
│  │   [image]   │  │   [image]   │  │   [image]   │ │
│  └─────────────┘  └─────────────┘  └─────────────┘ │
└──────────────────────────────────────────────────────┘
```

### **Mobile Considerations**
- Search bar takes full width
- Extracted parameter tags stack vertically
- "Clear filters" button sticky at bottom
- Voice input option (future P2 feature)

---

## Success Metrics

### **Adoption Metrics**
- % of planners who use natural language search vs. traditional filters
- Average searches per planner session
- % of searches that result in quote requests

### **Quality Metrics**
- % of queries with 0 results (target: <10%)
- % of queries with >50 results (too broad, target: <15%)
- Average time to first quote request after search (target: <2 min)

### **Parameter Extraction Accuracy**
- % of queries where location correctly extracted
- % of queries where budget correctly extracted
- % of queries where capacity correctly extracted

### **User Satisfaction**
- Thumbs up/down on search results
- Net Promoter Score question: "How likely are you to recommend this search feature?"

---

## Testing Plan

### **Unit Tests**
```typescript
describe('Vector Search', () => {
  it('generates embeddings for text', async () => {
    const text = 'mediterranean venue in austin for 150 people';
    const embedding = await generateEmbedding(text);
    expect(embedding).toHaveLength(1536); // OpenAI text-embedding-3-small
    expect(typeof embedding[0]).toBe('number');
  });

  it('generates consistent embeddings for same text', async () => {
    const text = 'italian restaurant downtown';
    const embedding1 = await generateEmbedding(text);
    const embedding2 = await generateEmbedding(text);
    expect(embedding1).toEqual(embedding2);
  });

  it('generates search description from package', () => {
    const pkg = {
      name: 'Villa Rosa',
      description: 'Beautiful Italian villa',
      venue_name: 'Villa Rosa Event Space',
      location: 'Austin, TX',
      cuisine_types: ['italian', 'mediterranean'],
      venue_type: 'garden',
      services_included: ['catering', 'bar service'],
      max_capacity: 200,
      price_min: 2000,
      price_max: 5000,
    };
    
    const description = generateSearchDescription(pkg);
    expect(description).toContain('Villa Rosa');
    expect(description).toContain('italian');
    expect(description).toContain('Austin');
    expect(description).toContain('200 people');
  });
});

describe('Semantic Search Quality', () => {
  it('finds relevant packages for semantic queries', async () => {
    // Query: "affordable outdoor wedding venue"
    // Should match packages with: outdoor, garden, budget-friendly, wedding keywords
    const results = await semanticSearch('affordable outdoor wedding venue');
    
    expect(results.length).toBeGreaterThan(0);
    expect(results[0].similarity).toBeGreaterThan(0.6);
    
    // Check if results contain outdoor-related packages
    const hasOutdoorVenues = results.some(r => 
      r.venue_type?.includes('outdoor') || 
      r.venue_type?.includes('garden')
    );
    expect(hasOutdoorVenues).toBe(true);
  });

  it('handles typos and variations', async () => {
    const result1 = await semanticSearch('mediteranean food'); // typo
    const result2 = await semanticSearch('mediterranean cuisine'); // variation
    
    // Should return similar packages despite different wording
    expect(result1.length).toBeGreaterThan(0);
    expect(result2.length).toBeGreaterThan(0);
  });

  it('understands synonyms', async () => {
    const result1 = await semanticSearch('cheap venue');
    const result2 = await semanticSearch('budget-friendly space');
    
    // Should prioritize low-priced packages
    expect(result1[0].price_min).toBeLessThan(2000);
    expect(result2[0].price_min).toBeLessThan(2000);
  });
});

describe('Hybrid Search', () => {
  it('combines semantic search with budget filter', async () => {
    const results = await hybridSearch({
      query: 'elegant wedding venue',
      budget_max: 3000,
    });

    // All results should be under budget
    expect(results.every(r => r.price_min <= 3000)).toBe(true);
  });

  it('combines semantic search with capacity filter', async () => {
    const results = await hybridSearch({
      query: 'italian restaurant',
      capacity_min: 150,
    });

    // All results should fit capacity
    expect(results.every(r => r.max_capacity >= 150)).toBe(true);
  });

  it('handles multiple filters simultaneously', async () => {
    const results = await hybridSearch({
      query: 'outdoor party venue',
      budget_max: 2500,
      capacity_min: 100,
      location: 'austin',
    });

    expect(results.every(r => 
      r.price_min <= 2500 &&
      r.max_capacity >= 100 &&
      r.location.toLowerCase().includes('austin')
    )).toBe(true);
  });
});
```

### **Integration Tests**
- Test embedding generation for all existing packages (backfill script)
- Test vector similarity search returns results sorted by relevance
- Verify index performance (query time < 200ms for 10k packages)
- Test edge cases:
  - Empty query → return error or popular packages
  - Query with no semantic matches → return empty array
  - Very long queries (>500 characters) → truncate or return error
- Test concurrent search requests (load testing)

### **Semantic Search Quality Testing**

**Create test dataset with ground truth:**
```typescript
const testQueries = [
  {
    query: 'mediterranean food venues in austin',
    expectedPackages: ['pkg-123', 'pkg-456'], // IDs of packages that should match
    minSimilarity: 0.7,
  },
  {
    query: 'budget wedding venue outdoors',
    expectedPackages: ['pkg-789'],
    minSimilarity: 0.65,
  },
  // Add 20-30 test cases
];

// Run quality tests
for (const test of testQueries) {
  const results = await semanticSearch(test.query);
  const topResults = results.slice(0, 5).map(r => r.id);
  
  // Check if expected packages are in top 5
  const recall = test.expectedPackages.filter(id => 
    topResults.includes(id)
  ).length / test.expectedPackages.length;
  
  console.log(`Query: "${test.query}" - Recall@5: ${recall}`);
  expect(recall).toBeGreaterThan(0.6); // 60% of expected results in top 5
}
```

### **Performance Benchmarking**
```typescript
// Test query latency
const queries = [
  'italian restaurant downtown',
  'outdoor wedding venue',
  'budget-friendly party space',
  // Add 20 common queries
];

for (const query of queries) {
  const start = Date.now();
  await semanticSearch(query);
  const duration = Date.now() - start;
  
  console.log(`Query: "${query}" - ${duration}ms`);
  expect(duration).toBeLessThan(500); // Target: <500ms
}

// Test with concurrent requests
const promises = queries.map(q => semanticSearch(q));
const start = Date.now();
await Promise.all(promises);
const duration = Date.now() - start;
console.log(`20 concurrent queries: ${duration}ms`);
```

### **User Acceptance Testing**
- Recruit 10 planners with different event types
- Give each 5 search scenarios:
  1. Find a venue for a specific event type (formal, casual, etc.)
  2. Find catering within a budget
  3. Find packages with specific cuisine
  4. Find venues with capacity requirements
  5. Free-form search with multiple criteria
- Collect feedback:
  - "Did the results match your expectations?" (1-5 scale)
  - "How many results did you need to view before finding a good match?"
  - "Were the top 3 results relevant?" (Yes/No)
- Success criteria: 80% of searches have ≥1 relevant result in top 3

---

## Database Schema Changes

### **Add Search History Table (Optional P1)**

```sql
CREATE TABLE search_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  query TEXT NOT NULL,
  extracted_params JSONB,
  result_count INTEGER,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_search_history_user ON search_history(user_id);
```

**Purpose:** Track search queries for analytics and personalization

---

## Implementation Phases

### **Phase 1: Infrastructure Setup (Week 1)**
- [ ] Enable pgvector extension in Supabase
- [ ] Add `embedding` column (vector) to packages table
- [ ] Add `search_description` column (text) to packages table
- [ ] Create vector similarity index (IVFFlat)
- [ ] Set up OpenAI API credentials
- [ ] Create embedding generation utility functions
- [ ] Write and test RPC function for `match_packages`

### **Phase 2: Data Preparation (Week 1-2)**
- [ ] Write function to generate search descriptions from packages
- [ ] Create backfill script for existing packages
- [ ] Run backfill and verify all packages have embeddings
- [ ] Create trigger/hook for auto-embedding on new packages
- [ ] Test embedding generation performance
- [ ] Implement error handling for failed embeddings

### **Phase 3: API Development (Week 2)**
- [ ] Create `/api/search/semantic` endpoint
- [ ] Implement query embedding generation
- [ ] Implement vector similarity search
- [ ] Add response formatting (include similarity scores)
- [ ] Implement error handling and rate limiting
- [ ] Add request logging for analytics

### **Phase 4: Hybrid Search (Week 2-3)**
- [ ] Create `hybrid_search_packages` RPC function
- [ ] Implement optional LLM parameter extraction (Claude)
- [ ] Create `/api/search/hybrid` endpoint
- [ ] Test combining semantic + structured filters
- [ ] Implement result ranking algorithm
- [ ] Add caching layer (Redis/Upstash)

### **Phase 5: Frontend Integration (Week 3)**
- [ ] Create search bar component on browse page
- [ ] Add loading states and error messages
- [ ] Display extracted parameters as tags
- [ ] Show similarity scores (optional debug mode)
- [ ] Implement search history dropdown
- [ ] Add "Clear filters" functionality
- [ ] Mobile responsive design

### **Phase 6: Testing & Optimization (Week 3-4)**
- [ ] Unit tests for embedding generation
- [ ] Integration tests for search endpoints
- [ ] Create test dataset with ground truth
- [ ] Run semantic search quality tests
- [ ] Performance benchmarking (query latency)
- [ ] A/B test setup (semantic search vs traditional filters)
- [ ] User acceptance testing with 10 planners

### **Phase 7: Monitoring & Analytics (Week 4)**
- [ ] Set up query analytics (Mixpanel/PostHog)
- [ ] Track search result click-through rates
- [ ] Monitor embedding generation costs
- [ ] Set up alerts for high latency queries
- [ ] Create dashboard for search quality metrics
- [ ] Document common search patterns

---

## Monitoring & Maintenance

### **Key Metrics to Monitor**

**Search Quality:**
- Average similarity score of top result
- % of searches with at least 1 result
- % of searches resulting in quote request
- Time from search to quote request

**Performance:**
- Query latency (p50, p95, p99)
- Embedding generation time
- Database index size
- Cache hit rate

**Cost:**
- OpenAI API costs (embeddings per month)
- Database storage costs (vectors)
- Average cost per search

### **Maintenance Tasks**

**Weekly:**
- Review failed embedding generations
- Check for packages without embeddings
- Monitor search quality metrics
- Review common queries with 0 results

**Monthly:**
- Analyze search patterns for improvements
- Update search description template if needed
- Re-generate embeddings if description format changes
- Optimize index parameters based on data size

**Quarterly:**
- Consider switching embedding models for better quality
- Evaluate if vector dimensions need adjustment
- Review and update test dataset
- Conduct user surveys on search satisfaction

### **Cost Estimation**

**OpenAI Embedding Costs:**
- Initial backfill (1000 packages): ~$0.10
- New packages (50/month): ~$0.005/month
- Search queries (10,000/month): ~$20/month
- **Total: ~$20-25/month**

**Supabase Storage:**
- 1000 packages × 1536 dimensions × 4 bytes = ~6 MB
- Negligible cost at scale

**Alternative (Self-Hosted):**
- Use open-source models (e.g., Sentence Transformers)
- Generate embeddings locally
- **Cost: $0, but requires GPU for fast inference**

---

## Troubleshooting Guide

### **Issue: Search returns no results**
**Causes:**
- Match threshold too high (decrease to 0.4)
- Query too specific or unusual
- Package embeddings not generated

**Solution:**
```sql
-- Check if embeddings exist
SELECT COUNT(*) FROM packages WHERE embedding IS NULL;

-- Lower threshold temporarily
SELECT * FROM match_packages(
  query_embedding := '...',
  match_threshold := 0.3  -- Lower threshold
);
```

### **Issue: Search is slow (>1 second)**
**Causes:**
- Index not created or incorrect type
- Too many packages without filters
- Embedding generation taking too long

**Solution:**
```sql
-- Check if index exists
SELECT * FROM pg_indexes WHERE tablename = 'packages';

-- Create HNSW index for better performance
DROP INDEX IF EXISTS packages_embedding_idx;
CREATE INDEX packages_embedding_idx ON packages 
USING hnsw (embedding vector_cosine_ops)
WITH (m = 16, ef_construction = 64);

-- Analyze table for query planner
ANALYZE packages;
```

### **Issue: Results not relevant**
**Causes:**
- Search description quality poor
- Embedding model not suitable
- Similarity threshold too low

**Solution:**
1. Review search descriptions: Do they contain relevant keywords?
2. Test different queries manually to see similarity scores
3. Consider using OpenAI's `text-embedding-3-large` for better quality
4. Implement relevance feedback: Ask users to rate results

### **Issue: High OpenAI API costs**
**Solutions:**
- Implement aggressive caching (cache for 24 hours)
- Use batch embedding generation
- Switch to `text-embedding-3-small` (cheaper)
- Consider self-hosted embedding models

---

## Complete Example: End-to-End Flow

### **User Journey:**

**Step 1: User enters query**
```typescript
// User types: "Find me venues in austin that offer mediterranean food to fit 150 people at a max budget of $3000"
```

**Step 2: Frontend sends request**
```typescript
// /app/components/SearchBar.tsx
const handleSearch = async (query: string) => {
  setLoading(true);
  
  const response = await fetch('/api/search/hybrid', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query }),
  });

  const data = await response.json();
  setResults(data.results);
  setExtractedParams(data.extractedParams);
  setLoading(false);
};
```

**Step 3: Backend processes query**
```typescript
// /app/api/search/hybrid/route.ts

// 3a. Extract structured parameters using Claude (optional)
const extractionPrompt = `Extract: location, budget_max, capacity_min from: "${query}"`;
const extractedParams = await extractParamsWithClaude(query);
// Result: { location: "austin", budget_max: 3000, capacity_min: 150 }

// 3b. Generate embedding for semantic search
const queryEmbedding = await generateEmbedding(query);
// Result: [0.123, -0.456, 0.789, ...] (1536 numbers)

// 3c. Perform hybrid search
const { data: packages } = await supabase.rpc('hybrid_search_packages', {
  query_embedding: queryEmbedding,
  budget_max: 3000,
  capacity_min: 150,
  location_filter: 'austin',
  match_threshold: 0.5,
  match_count: 50,
});
```

**Step 4: Database executes vector search**
```sql
-- Supabase executes:
SELECT
  id, name, description, location, price_min, max_capacity,
  1 - (embedding <=> query_embedding) AS similarity  -- Cosine similarity
FROM packages
WHERE embedding IS NOT NULL
  AND is_active = true
  AND 1 - (embedding <=> query_embedding) > 0.5  -- Similarity threshold
  AND price_min <= 3000  -- Budget filter
  AND max_capacity >= 150  -- Capacity filter
  AND location ILIKE '%austin%'  -- Location filter
ORDER BY embedding <=> query_embedding  -- Closest vectors first
LIMIT 50;
```

**Step 5: Results returned**
```json
{
  "results": [
    {
      "id": "pkg-123",
      "name": "Mediterranean Villa Austin",
      "description": "Beautiful Mediterranean-style venue with authentic cuisine",
      "location": "Central Austin, TX",
      "price_min": 2500,
      "price_max": 4000,
      "max_capacity": 200,
      "cuisine_types": ["mediterranean", "greek"],
      "similarity": 0.87  // Very relevant!
    },
    {
      "id": "pkg-456",
      "name": "Austin Garden Events",
      "description": "Outdoor venue featuring Mediterranean catering options",
      "location": "South Austin, TX",
      "price_min": 2000,
      "price_max": 3500,
      "max_capacity": 175,
      "cuisine_types": ["mediterranean", "italian"],
      "similarity": 0.82
    }
    // ... more results
  ],
  "extractedParams": {
    "location": "austin",
    "budget_max": 3000,
    "capacity_min": 150
  },
  "count": 12
}
```

**Step 6: Frontend displays results**
```tsx
// Search Results UI
<div>
  <h2>Search Results for:</h2>
  <div className="flex gap-2 mb-4">
    <Badge>📍 Austin</Badge>
    <Badge>💰 $3000 max</Badge>
    <Badge>👥 150 people</Badge>
    <Badge>🍽️ Mediterranean</Badge>
  </div>
  
  <p className="text-gray-600">12 packages found</p>
  
  <div className="grid grid-cols-3 gap-4">
    {results.map(pkg => (
      <PackageCard 
        key={pkg.id}
        package={pkg}
        similarity={pkg.similarity}  // Show in debug mode
      />
    ))}
  </div>
</div>
```

---

## Why Vector Search is Better

### **Comparison: Traditional vs Vector Search**

| Query | Traditional Filters | Vector Search |
|-------|-------------------|---------------|
| "affordable venue" | ❌ No "affordable" field | ✅ Matches low-price packages semantically |
| "mediteranean" (typo) | ❌ No results | ✅ Still finds mediterranean packages |
| "elegant ballroom" | ❌ Only matches if "elegant" is a tag | ✅ Matches formal, upscale venues |
| "casual outdoor party" | ❌ Must select multiple checkboxes | ✅ Finds garden/patio venues with laid-back vibe |
| "corporate networking event" | ❌ Generic "event type" filter | ✅ Understands professional setting needs |

### **Example Semantic Matches**

**Query:** "romantic dinner venue"
- **Matches:** Packages with words like "intimate", "candlelit", "couples", "anniversary"
- **Why:** Vector embeddings capture semantic meaning, not just keywords

**Query:** "kid-friendly party space"
- **Matches:** Venues mentioning "family", "children", "playground", "games"
- **Why:** The model understands context and related concepts

**Query:** "budget corporate lunch"
- **Matches:** Affordable packages with "professional", "business", "catering"
- **Why:** Combines price signals with event type understanding

---

## Launch Checklist

- [ ] pgvector extension enabled in Supabase
- [ ] All packages have embeddings generated
- [ ] Vector similarity index created and analyzed
- [ ] Search API endpoints tested with 20+ queries
- [ ] LLM parameter extraction tested (if using)
- [ ] Frontend search bar integrated on browse page
- [ ] Results display showing similarity scores (debug mode)
- [ ] Error handling for edge cases (no results, API failures)
- [ ] Caching layer implemented (Redis/Upstash)
- [ ] Analytics tracking configured (Mixpanel)
- [ ] Performance benchmarks meet targets (<500ms)
- [ ] User acceptance testing completed (80%+ satisfaction)
- [ ] Documentation for search quality monitoring
- [ ] Cost monitoring dashboard set up (OpenAI usage)
- [ ] A/B test infrastructure ready (50/50 split)

---

## Future Enhancements (P2+)

### **1. Query Expansion**
Use LLM to expand user query before embedding:
```typescript
// User: "cheap venue"
// Expanded: "affordable budget-friendly economical inexpensive venue space"
const expandedQuery = await expandQueryWithLLM(originalQuery);
const embedding = await generateEmbedding(expandedQuery);
```

### **2. Personalized Search Ranking**
Adjust results based on user's past bookings:
```typescript
// Boost packages similar to what user booked before
const userHistory = await getUserPastBookings(userId);
const userPreferenceEmbedding = await generateEmbedding(
  userHistory.map(b => b.package.description).join(' ')
);

// Combine query embedding with user preference
const combinedEmbedding = weighted_average(
  queryEmbedding * 0.7,
  userPreferenceEmbedding * 0.3
);
```

### **3. Multi-Modal Search (Images)**
Allow users to upload inspiration photos:
```typescript
// Generate image embedding using CLIP
const imageEmbedding = await generateImageEmbedding(uploadedPhoto);

// Search for packages with similar visual style
const results = await supabase.rpc('match_packages_by_image', {
  query_embedding: imageEmbedding,
});
```

### **4. Conversational Refinement**
Enable follow-up queries:
```typescript
// Initial: "venues in austin"
// Follow-up: "show me cheaper options"
// System maintains context and refines search
const conversationHistory = [
  { role: 'user', content: 'venues in austin' },
  { role: 'assistant', content: 'Here are 12 packages...' },
  { role: 'user', content: 'show me cheaper options' }
];

// LLM understands to keep location but lower budget
```

### **5. Semantic Facets**
Auto-generate filter categories from vector space:
```typescript
// Cluster packages by semantic similarity
// Show filters like: "Elegant", "Casual", "Outdoor", "Urban"
// Instead of predefined checkboxes
```

### **6. Query Understanding & Suggestions**
Show alternative interpretations:
```typescript
// User: "nice venue"
// Suggestions: 
//   - "Did you mean: elegant venue?"
//   - "Or: upscale venue?"
//   - "Or: high-rated venue?"
```

### **7. Voice Search**
Mobile voice input with speech-to-text:
```tsx
<button onClick={startVoiceSearch}>
  🎤 Speak your search
</button>
// Converts speech → text → embedding → search
```

### **8. Real-Time Collaborative Filtering**
"Users who searched for this also searched for..."
```typescript
// Track search-to-booking patterns
// Recommend packages others found after similar searches
```

---

## Open Questions

1. Should we show a "Search powered by AI" badge to set expectations?
2. Do we need to handle negative queries (e.g., "no mexican food")?
3. Should synonyms be supported (e.g., "inexpensive" = low budget)?
4. How do we handle ambiguous locations (e.g., "downtown" - which city)?
5. Should exact phrase matching be supported (e.g., quotation marks)?

---

## Appendix: Example Queries & Expected Extractions

| Query | Location | Budget | Capacity | Food Type | Other |
|-------|----------|--------|----------|-----------|-------|
| "venues in austin under $3000 for 150 people with mediterranean food" | austin | max: 3000 | min: 150 | mediterranean | - |
| "outdoor venue near campus for 50-75 guests" | campus | - | 50-75 | - | venue_type: outdoor |
| "need DJ and catering for birthday party, budget $2k" | - | max: 2000 | - | - | services: dj, catering; event: birthday |
| "cheap venues downtown" | downtown | - | - | - | (interpret "cheap" as low price_min) |
| "italian restaurant for 100 people in south austin" | south austin | - | min: 100 | italian | - |

