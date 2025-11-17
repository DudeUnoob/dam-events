/**
 * Search Suggestion Utilities
 * Provides "Did you mean?" suggestions and related searches
 */

import OpenAI from 'openai';

// Lazy initialization of OpenAI client
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
 * Generate "Did you mean?" suggestions for queries with few/no results
 */
export async function generateDidYouMean(
  query: string,
  resultCount: number
): Promise<string[]> {
  // Only suggest if results are poor (less than 3)
  if (resultCount >= 3) {
    return [];
  }

  try {
    const client = getOpenAIClient();
    const prompt = `The user searched for "${query}" for event packages and got ${resultCount} results.

Suggest 3 alternative search queries that might work better. Consider:
- Common typos and corrections
- More specific or broader terms
- Related event planning queries
- Different phrasing of the same intent

Return ONLY a JSON array of 3 strings. Each should be a complete search query.

Example:
Input: "seafood food" (0 results)
Output: ["seafood catering", "ocean-themed menu", "fish and seafood buffet"]`;

    const response = await client.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You generate helpful search suggestions. Return only JSON arrays.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 150,
      response_format: { type: 'json_object' },
    });

    const responseText = response.choices[0].message.content || '{"suggestions":[]}';
    const parsed = JSON.parse(responseText);

    // Handle both array and object responses
    const suggestions = Array.isArray(parsed)
      ? parsed
      : parsed.suggestions || parsed.alternatives || [];

    return suggestions.slice(0, 3);
  } catch (error) {
    console.error('Error generating suggestions:', error);
    return [];
  }
}

/**
 * Generate related search queries based on current query
 */
export async function generateRelatedSearches(
  query: string
): Promise<string[]> {
  try {
    const client = getOpenAIClient();
    const prompt = `Generate 5 related search queries for someone searching "${query}" for event packages.

Make each query:
- Semantically related but different aspect
- Useful for event planning
- 3-7 words long

Return ONLY a JSON array of 5 strings.

Example:
Input: "seafood buffet"
Output: ["outdoor seafood venue", "coastal wedding packages", "beach reception catering", "waterfront event space", "seafood dinner party"]`;

    const response = await client.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You generate related search queries. Return only JSON arrays.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.8, // More creative
      max_tokens: 200,
      response_format: { type: 'json_object' },
    });

    const responseText = response.choices[0].message.content || '{"queries":[]}';
    const parsed = JSON.parse(responseText);

    const queries = Array.isArray(parsed)
      ? parsed
      : parsed.queries || parsed.searches || [];

    return queries.slice(0, 5);
  } catch (error) {
    console.error('Error generating related searches:', error);
    return [];
  }
}

/**
 * Analyze search quality and provide feedback
 */
export interface SearchQuality {
  score: number; // 0-1, higher is better
  issues: string[];
  suggestions: string[];
}

export function analyzeSearchQuality(
  query: string,
  resultCount: number,
  extractedParams: any
): SearchQuality {
  const issues: string[] = [];
  const suggestions: string[] = [];
  let score = 1.0;

  // Check query length
  if (query.length < 5) {
    issues.push('Query is too short');
    suggestions.push('Try adding more descriptive words');
    score -= 0.3;
  }

  // Check if too vague
  const vagueTerm = ['nice', 'good', 'great', 'amazing', 'best'].some(term =>
    query.toLowerCase().includes(term)
  );
  if (vagueTerm) {
    issues.push('Query contains vague terms');
    suggestions.push('Use specific terms like "elegant", "rustic", or "modern"');
    score -= 0.2;
  }

  // Check result count
  if (resultCount === 0) {
    issues.push('No results found');
    suggestions.push('Try broader terms or check spelling');
    score = 0;
  } else if (resultCount < 3) {
    issues.push('Very few results');
    suggestions.push('Try removing some filters or using broader terms');
    score -= 0.4;
  } else if (resultCount > 50) {
    issues.push('Too many results');
    suggestions.push('Add more specific details (budget, location, style)');
    score -= 0.1;
  }

  // Check if parameters were extracted
  const hasParams =
    extractedParams.budget_max ||
    extractedParams.capacity_min ||
    extractedParams.location;

  if (!hasParams && query.length > 10) {
    suggestions.push(
      'Try adding specific details like "for 100 people" or "under $5000"'
    );
  }

  return {
    score: Math.max(0, Math.min(1, score)),
    issues,
    suggestions,
  };
}

/**
 * Popular/trending search suggestions (could be powered by search history)
 */
export const POPULAR_SEARCHES = [
  'outdoor wedding venue',
  'affordable birthday party',
  'corporate event catering',
  'elegant reception venue',
  'rustic barn wedding',
  'rooftop event space',
  'vegan catering options',
  'waterfront venue',
  'intimate wedding packages',
  'large corporate event',
];

/**
 * Auto-complete suggestions based on partial query
 */
export function getAutocompleteSuggestions(
  partialQuery: string
): string[] {
  if (partialQuery.length < 2) return [];

  const lowerQuery = partialQuery.toLowerCase();

  // Filter popular searches that match
  return POPULAR_SEARCHES.filter(search =>
    search.toLowerCase().includes(lowerQuery)
  ).slice(0, 5);
}
