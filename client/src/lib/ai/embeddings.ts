/**
 * AI Embeddings Utility
 * Handles vector embedding generation using OpenAI's text-embedding-3-small model
 * and query parameter extraction using GPT-4
 */

import OpenAI from 'openai';

// Lazy initialization of OpenAI client (allows dotenv to load first)
let openai: OpenAI | null = null;

function getOpenAIClient(): OpenAI {
  if (!openai) {
    openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }
  return openai;
}

/**
 * Generate embedding vector for a single text string
 * Uses OpenAI text-embedding-3-small (1536 dimensions, $0.02 per 1M tokens)
 */
export async function generateEmbedding(text: string): Promise<number[]> {
  try {
    const client = getOpenAIClient();
    const response = await client.embeddings.create({
      model: 'text-embedding-3-small',
      input: text,
      encoding_format: 'float',
    });

    return response.data[0].embedding;
  } catch (error) {
    console.error('Error generating embedding:', error);
    throw new Error('Failed to generate embedding');
  }
}

/**
 * Generate embeddings for multiple texts in a single API call (more efficient)
 * Useful for batch processing during backfill
 */
export async function generateEmbeddingsBatch(
  texts: string[]
): Promise<number[][]> {
  try {
    const client = getOpenAIClient();
    const response = await client.embeddings.create({
      model: 'text-embedding-3-small',
      input: texts,
      encoding_format: 'float',
    });

    return response.data.map((item) => item.embedding);
  } catch (error) {
    console.error('Error generating batch embeddings:', error);
    throw new Error('Failed to generate batch embeddings');
  }
}

/**
 * Generate search description from package data
 * This is the text that will be embedded for semantic search
 */
export function generateSearchDescription(pkg: {
  name: string;
  description: string;
  venue_details: any;
  catering_details: any;
  entertainment_details: any;
  price_min: number;
  price_max: number;
  capacity: number;
}): string {
  const parts: string[] = [];

  // Package name and description
  parts.push(pkg.name);
  parts.push(pkg.description);

  // Venue details
  if (pkg.venue_details) {
    const venue = pkg.venue_details;
    if (venue.name) parts.push(`Venue: ${venue.name}`);
    if (venue.type) parts.push(`${venue.type} venue`);
    if (venue.amenities) {
      const amenities = Array.isArray(venue.amenities)
        ? venue.amenities.join(', ')
        : venue.amenities;
      parts.push(`Amenities: ${amenities}`);
    }
  }

  // Catering details
  if (pkg.catering_details) {
    const catering = pkg.catering_details;
    if (catering.menu_options) {
      const menuOptions = Array.isArray(catering.menu_options)
        ? catering.menu_options.join(', ')
        : catering.menu_options;
      parts.push(`Food: ${menuOptions}`);
    }
    if (catering.dietary_accommodations) {
      const dietary = Array.isArray(catering.dietary_accommodations)
        ? catering.dietary_accommodations.join(', ')
        : catering.dietary_accommodations;
      parts.push(`Dietary options: ${dietary}`);
    }
    if (catering.cuisine_type) {
      parts.push(`${catering.cuisine_type} cuisine`);
    }
  }

  // Entertainment details
  if (pkg.entertainment_details) {
    const entertainment = pkg.entertainment_details;
    if (entertainment.type) parts.push(`Entertainment: ${entertainment.type}`);
    if (entertainment.equipment) {
      const equipment = Array.isArray(entertainment.equipment)
        ? entertainment.equipment.join(', ')
        : entertainment.equipment;
      parts.push(`Equipment: ${equipment}`);
    }
  }

  // Capacity and pricing
  parts.push(`Capacity: ${pkg.capacity} people`);
  parts.push(`Price range: $${pkg.price_min} to $${pkg.price_max}`);

  return parts.filter(Boolean).join('. ');
}

/**
 * Extracted search parameters from natural language query
 */
export interface ExtractedParams {
  budget_max: number | null;
  capacity_min: number | null;
  location: string | null;
  food_type: string | null;
  event_type: string | null;
  venue_type: string | null;
}

/**
 * Extract structured parameters from natural language query using GPT-4
 * Example: "venues in austin under $3000 for 150 people" ->
 *   { budget_max: 3000, capacity_min: 150, location: "austin", ... }
 */
export async function extractParametersWithGPT(
  query: string
): Promise<ExtractedParams> {
  try {
    const client = getOpenAIClient();
    const extractionPrompt = `Extract structured search parameters from this event planning query. Return ONLY valid JSON.

Query: "${query}"

Extract these fields (use null if not mentioned):
- budget_max: maximum budget in dollars (number or null)
- capacity_min: minimum guest capacity (number or null)
- location: city or area name (string or null)
- food_type: cuisine type or food preference (string or null)
- event_type: type of event like "wedding", "birthday", "corporate" (string or null)
- venue_type: venue style like "outdoor", "indoor", "garden" (string or null)

Return ONLY a JSON object with these exact keys. No explanations.`;

    const response = await client.chat.completions.create({
      model: 'gpt-4o-mini', // Fast and cost-effective
      messages: [
        {
          role: 'system',
          content:
            'You are a JSON extraction assistant. Return only valid JSON, no markdown, no explanations.',
        },
        {
          role: 'user',
          content: extractionPrompt,
        },
      ],
      temperature: 0, // Deterministic output
      max_tokens: 200,
      response_format: { type: 'json_object' }, // Ensure JSON response
    });

    const responseText = response.choices[0].message.content || '{}';
    const extractedParams = JSON.parse(responseText);

    // Ensure all expected fields exist with proper types
    return {
      budget_max: extractedParams.budget_max || null,
      capacity_min: extractedParams.capacity_min || null,
      location: extractedParams.location || null,
      food_type: extractedParams.food_type || null,
      event_type: extractedParams.event_type || null,
      venue_type: extractedParams.venue_type || null,
    };
  } catch (error) {
    console.error('Error extracting parameters with GPT:', error);
    // Return empty params on failure (fallback to pure semantic search)
    return {
      budget_max: null,
      capacity_min: null,
      location: null,
      food_type: null,
      event_type: null,
      venue_type: null,
    };
  }
}

/**
 * Validate that embedding has correct dimensions
 */
export function validateEmbedding(embedding: number[]): boolean {
  return Array.isArray(embedding) && embedding.length === 1536;
}

/**
 * Calculate cosine similarity between two embeddings
 * Useful for client-side filtering or debugging
 */
export function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length) {
    throw new Error('Embeddings must have same dimensions');
  }

  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }

  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

/**
 * Expand user query with semantically related terms
 * Example: "seafood" → "seafood fish ocean marine shrimp lobster crab dishes menu"
 *
 * This dramatically improves search recall by catching variations and related concepts
 */
export async function expandQuery(query: string): Promise<string> {
  try {
    const client = getOpenAIClient();
    const expansionPrompt = `Expand this event search query with 8-12 semantically related terms.

Query: "${query}"

Return ONLY the expanded query as a single line of space-separated keywords.
Include:
- Synonyms
- Related concepts
- Common variations
- Specific examples
- Culinary terms (if food-related)
- Venue styles (if venue-related)

Example:
Input: "seafood food"
Output: seafood ocean marine fish shellfish lobster crab shrimp salmon cuisine dishes menu buffet coastal

Return ONLY the expanded keywords, no explanations.`;

    const response = await client.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content:
            'You expand search queries with related terms. Return only keywords separated by spaces.',
        },
        {
          role: 'user',
          content: expansionPrompt,
        },
      ],
      temperature: 0.3, // Some creativity but mostly consistent
      max_tokens: 150,
    });

    const expandedQuery = response.choices[0].message.content?.trim() || query;

    // Combine original query with expanded terms
    return `${query} ${expandedQuery}`;
  } catch (error) {
    console.error('Error expanding query:', error);
    // Return original query on failure
    return query;
  }
}

/**
 * Generate multiple query variations for multi-query retrieval
 * Example: "seafood food" → ["seafood cuisine menu", "ocean food dishes", "marine catering"]
 */
export async function generateQueryVariations(query: string): Promise<string[]> {
  try {
    const client = getOpenAIClient();
    const variationsPrompt = `Generate 3 alternative phrasings of this search query for event packages.

Query: "${query}"

Return ONLY valid JSON array of 3 strings, no explanations.
Make each variation:
- Semantically equivalent but worded differently
- 3-6 words long
- Natural sounding
- Focused on the core intent

Example:
Input: "seafood food"
Output: ["seafood cuisine menu", "ocean dining options", "fish and shellfish catering"]

Return ONLY the JSON array.`;

    const response = await client.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content:
            'You generate query variations. Return only a JSON array of strings.',
        },
        {
          role: 'user',
          content: variationsPrompt,
        },
      ],
      temperature: 0.5, // More creative for variations
      max_tokens: 150,
      response_format: { type: 'json_object' },
    });

    const responseText = response.choices[0].message.content || '{"variations":[]}';
    const parsed = JSON.parse(responseText);

    // Handle both array and object responses
    const variations = Array.isArray(parsed) ? parsed : (parsed.variations || []);

    // Return variations, fallback to original query
    return variations.length > 0 ? variations : [query];
  } catch (error) {
    console.error('Error generating query variations:', error);
    // Return original query on failure
    return [query];
  }
}
