/**
 * Query Preprocessing Utilities
 * Handles typo correction, normalization, and query enhancement
 */

/**
 * Calculate Levenshtein distance between two strings
 * Used for typo detection and correction
 */
function levenshteinDistance(str1: string, str2: string): number {
  const matrix: number[][] = [];

  for (let i = 0; i <= str2.length; i++) {
    matrix[i] = [i];
  }

  for (let j = 0; j <= str1.length; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= str2.length; i++) {
    for (let j = 1; j <= str1.length; j++) {
      if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // substitution
          matrix[i][j - 1] + 1, // insertion
          matrix[i - 1][j] + 1 // deletion
        );
      }
    }
  }

  return matrix[str2.length][str1.length];
}

/**
 * Common event-planning domain vocabulary for typo correction
 */
const DOMAIN_VOCABULARY = [
  // Food types
  'seafood', 'vegan', 'vegetarian', 'pescatarian', 'kosher', 'halal',
  'gluten-free', 'dairy-free', 'buffet', 'plated', 'catering', 'cuisine',
  'menu', 'dishes', 'appetizers', 'entrees', 'desserts',

  // Cuisines
  'italian', 'mexican', 'asian', 'mediterranean', 'american', 'french',
  'japanese', 'chinese', 'indian', 'thai', 'greek', 'spanish',

  // Venue types
  'outdoor', 'indoor', 'garden', 'rooftop', 'ballroom', 'barn', 'beach',
  'waterfront', 'downtown', 'countryside', 'estate', 'loft', 'terrace',

  // Event types
  'wedding', 'birthday', 'anniversary', 'corporate', 'conference',
  'gala', 'reception', 'party', 'celebration', 'fundraiser', 'graduation',

  // Entertainment
  'DJ', 'band', 'live music', 'dancing', 'karaoke', 'photo booth',
  'entertainment', 'acoustic', 'jazz', 'classical',

  // Amenities
  'parking', 'accessible', 'air-conditioned', 'wifi', 'projector',
  'sound system', 'lighting', 'stage', 'dance floor', 'bar',

  // Common terms
  'guests', 'people', 'capacity', 'budget', 'affordable', 'luxury',
  'elegant', 'rustic', 'modern', 'vintage', 'romantic', 'casual',
];

/**
 * Correct potential typos in query using domain vocabulary
 */
export function correctTypos(query: string): string {
  const words = query.toLowerCase().split(/\s+/);
  const correctedWords = words.map(word => {
    // Skip very short words (likely correct)
    if (word.length <= 3) return word;

    // Find closest match in vocabulary
    let bestMatch = word;
    let minDistance = 3; // Only correct if distance <= 2

    for (const vocabWord of DOMAIN_VOCABULARY) {
      const distance = levenshteinDistance(word, vocabWord);

      // If exact match, return immediately
      if (distance === 0) return word;

      // If close enough, consider as correction
      if (distance < minDistance) {
        minDistance = distance;
        bestMatch = vocabWord;
      }
    }

    return bestMatch;
  });

  return correctedWords.join(' ');
}

/**
 * Synonym mapping for common event planning terms
 */
const SYNONYM_MAP: Record<string, string[]> = {
  'food': ['catering', 'cuisine', 'menu', 'dining'],
  'music': ['entertainment', 'band', 'dj', 'live music'],
  'venue': ['space', 'location', 'site', 'place'],
  'cheap': ['affordable', 'budget-friendly', 'economical'],
  'expensive': ['luxury', 'premium', 'high-end', 'upscale'],
  'big': ['large', 'spacious', 'grand'],
  'small': ['intimate', 'cozy', 'compact'],
  'nice': ['elegant', 'beautiful', 'stunning', 'lovely'],
  'outside': ['outdoor', 'al fresco', 'open-air'],
  'inside': ['indoor', 'enclosed'],
};

/**
 * Expand query with synonyms
 */
export function addSynonyms(query: string): string {
  const words = query.toLowerCase().split(/\s+/);
  const expandedWords = [...words];

  words.forEach(word => {
    if (SYNONYM_MAP[word]) {
      // Add first 2 synonyms
      expandedWords.push(...SYNONYM_MAP[word].slice(0, 2));
    }
  });

  return expandedWords.join(' ');
}

/**
 * Remove duplicate words from query
 */
export function removeDuplicates(query: string): string {
  const words = query.toLowerCase().split(/\s+/);
  const uniqueWords = [...new Set(words)];
  return uniqueWords.join(' ');
}

/**
 * Normalize query by removing special characters and extra spaces
 */
export function normalizeQuery(query: string): string {
  return query
    .toLowerCase()
    .replace(/[^\w\s-]/g, ' ') // Remove special chars except hyphens
    .replace(/\s+/g, ' ') // Normalize whitespace
    .trim();
}

/**
 * Extract price range from query
 * Examples: "$500-1000", "under $2000", "less than 3000"
 */
export function extractPriceRange(query: string): { min?: number; max?: number } | null {
  // Match patterns like "$500-1000" or "$500 to $1000"
  const rangeMatch = query.match(/\$?(\d+)\s*[-to]+\s*\$?(\d+)/i);
  if (rangeMatch) {
    return {
      min: parseInt(rangeMatch[1]),
      max: parseInt(rangeMatch[2]),
    };
  }

  // Match "under $X" or "less than $X" or "below $X"
  const maxMatch = query.match(/(under|less than|below|max)\s+\$?(\d+)/i);
  if (maxMatch) {
    return { max: parseInt(maxMatch[2]) };
  }

  // Match "over $X" or "more than $X" or "above $X"
  const minMatch = query.match(/(over|more than|above|min)\s+\$?(\d+)/i);
  if (minMatch) {
    return { min: parseInt(minMatch[2]) };
  }

  return null;
}

/**
 * Extract guest count from query
 * Examples: "50 people", "100 guests", "for 150"
 */
export function extractGuestCount(query: string): number | null {
  const match = query.match(/(?:for\s+)?(\d+)\s*(?:people|guests|attendees|persons)?/i);
  if (match) {
    const count = parseInt(match[1]);
    // Only return if it looks like a guest count (reasonable range)
    if (count >= 10 && count <= 10000) {
      return count;
    }
  }
  return null;
}

/**
 * Extract location from query
 * Examples: "in Austin", "near downtown", "Austin TX"
 */
export function extractLocation(query: string): string | null {
  // Match "in [location]" or "near [location]"
  const match = query.match(/(?:in|near|at)\s+([A-Z][a-zA-Z\s]+?)(?:\s+(?:TX|Texas|for|with|under|over|\d))/i);
  if (match) {
    return match[1].trim();
  }

  // Match standalone city names (capitalized)
  const cityMatch = query.match(/\b([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)\b/);
  if (cityMatch) {
    const possibleCity = cityMatch[1];
    // Common Texas cities
    const texasCities = ['Austin', 'Dallas', 'Houston', 'San Antonio', 'Fort Worth', 'Arlington'];
    if (texasCities.includes(possibleCity)) {
      return possibleCity;
    }
  }

  return null;
}

/**
 * Complete preprocessing pipeline
 */
export interface PreprocessedQuery {
  original: string;
  normalized: string;
  corrected: string;
  withSynonyms: string;
  priceRange: { min?: number; max?: number } | null;
  guestCount: number | null;
  location: string | null;
}

export function preprocessQuery(query: string): PreprocessedQuery {
  const normalized = normalizeQuery(query);
  const corrected = correctTypos(normalized);
  const withSynonyms = addSynonyms(corrected);
  const deduplicated = removeDuplicates(withSynonyms);

  return {
    original: query,
    normalized,
    corrected,
    withSynonyms: deduplicated,
    priceRange: extractPriceRange(query),
    guestCount: extractGuestCount(query),
    location: extractLocation(query),
  };
}
