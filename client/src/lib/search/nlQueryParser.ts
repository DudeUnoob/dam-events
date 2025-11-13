/**
 * Natural Language Query Parser
 * Extracts search intent from natural language queries
 */

export interface SearchIntent {
  keywords: string[];
  guestCount?: number;
  budget?: {
    min?: number;
    max?: number;
  };
  eventType?: string;
  location?: string;
  amenities?: string[];
  rawQuery: string;
}

/**
 * Parse a natural language search query and extract structured intent
 */
export function parseNaturalLanguageQuery(query: string): SearchIntent {
  const intent: SearchIntent = {
    keywords: [],
    rawQuery: query,
  };

  const lowerQuery = query.toLowerCase();

  // Extract guest count
  // Patterns: "for 100 people", "50 guests", "capacity 200", "100-150 people"
  const guestPatterns = [
    /(?:for|capacity|accommodate|holds?)\s+(\d+)(?:-(\d+))?\s*(?:people|guests?|pax)?/i,
    /(\d+)(?:-(\d+))?\s*(?:people|guests?|pax)/i,
  ];

  for (const pattern of guestPatterns) {
    const match = query.match(pattern);
    if (match) {
      // If range is provided, use the upper bound
      intent.guestCount = match[2] ? parseInt(match[2]) : parseInt(match[1]);
      break;
    }
  }

  // Extract budget
  // Patterns: "under $5000", "$2000-$5000", "budget $3000", "within $1000"
  const budgetPatterns = [
    /\$(\d+(?:,\d+)*(?:\.\d+)?)\s*(?:to|-)\s*\$?(\d+(?:,\d+)*(?:\.\d+)?)/i, // $2000-$5000 or $2000 to $5000
    /(?:under|below|less than|max|maximum)\s*\$?(\d+(?:,\d+)*(?:\.\d+)?)/i, // under $5000
    /(?:above|over|more than|min|minimum)\s*\$?(\d+(?:,\d+)*(?:\.\d+)?)/i, // above $2000
    /(?:budget|around|approximately|about)\s*\$?(\d+(?:,\d+)*(?:\.\d+)?)/i, // budget $3000
    /\$(\d+(?:,\d+)*(?:\.\d+)?)/i, // Just $5000
  ];

  for (const pattern of budgetPatterns) {
    const match = query.match(pattern);
    if (match) {
      const cleanNumber = (str: string) => parseFloat(str.replace(/,/g, ''));

      if (match[0].match(/to|-/) && match[2]) {
        // Range: $2000-$5000
        intent.budget = {
          min: cleanNumber(match[1]),
          max: cleanNumber(match[2]),
        };
      } else if (match[0].match(/under|below|less than|max|maximum/i)) {
        // Max: under $5000
        intent.budget = { max: cleanNumber(match[1]) };
      } else if (match[0].match(/above|over|more than|min|minimum/i)) {
        // Min: above $2000
        intent.budget = { min: cleanNumber(match[1]) };
      } else {
        // Single value - treat as approximate max
        const value = cleanNumber(match[1]);
        intent.budget = { max: value };
      }
      break;
    }
  }

  // Extract event type
  const eventTypes = [
    'wedding', 'corporate', 'birthday', 'anniversary',
    'graduation', 'reunion', 'baby shower', 'bridal shower',
    'conference', 'seminar', 'gala', 'fundraiser',
    'reception', 'ceremony', 'party', 'celebration'
  ];

  for (const eventType of eventTypes) {
    if (lowerQuery.includes(eventType)) {
      intent.eventType = eventType;
      break;
    }
  }

  // Extract location
  // Patterns: "in Austin", "near downtown", "at lakeside"
  const locationPatterns = [
    /(?:in|at|near|around)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/,
    /([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)\s+(?:area|location|venue)/,
  ];

  for (const pattern of locationPatterns) {
    const match = query.match(pattern);
    if (match) {
      intent.location = match[1];
      break;
    }
  }

  // Extract amenities/features
  const amenityKeywords = [
    'parking', 'wifi', 'pool', 'outdoor', 'indoor',
    'catering', 'bar', 'dance floor', 'stage',
    'kitchen', 'av equipment', 'projector', 'sound system',
    'accessible', 'handicap', 'wheelchair',
    'garden', 'patio', 'terrace', 'balcony',
  ];

  intent.amenities = amenityKeywords.filter(amenity =>
    lowerQuery.includes(amenity)
  );

  // Extract general keywords
  // Remove the extracted structured data and get remaining keywords
  let keywordQuery = query;

  // Remove numbers and currency
  keywordQuery = keywordQuery.replace(/\$?\d+(?:,\d+)*(?:\.\d+)?/g, ' ');

  // Remove common filler words
  const fillerWords = [
    'for', 'with', 'the', 'a', 'an', 'in', 'at', 'on', 'to', 'and', 'or',
    'under', 'above', 'below', 'people', 'guests', 'capacity', 'budget',
    'around', 'approximately', 'about', 'within', 'near', 'venue', 'package'
  ];

  const words = keywordQuery
    .toLowerCase()
    .split(/\s+/)
    .filter(word =>
      word.length > 2 &&
      !fillerWords.includes(word) &&
      !/^[\d\s\$,.-]+$/.test(word)
    );

  intent.keywords = [...new Set(words)]; // Remove duplicates

  return intent;
}

/**
 * Generate a user-friendly description of the parsed intent
 */
export function describeIntent(intent: SearchIntent): string {
  const parts: string[] = [];

  if (intent.eventType) {
    parts.push(`${intent.eventType} event`);
  }

  if (intent.guestCount) {
    parts.push(`for ${intent.guestCount} guests`);
  }

  if (intent.budget) {
    if (intent.budget.min && intent.budget.max) {
      parts.push(`budget $${intent.budget.min.toLocaleString()}-$${intent.budget.max.toLocaleString()}`);
    } else if (intent.budget.max) {
      parts.push(`under $${intent.budget.max.toLocaleString()}`);
    } else if (intent.budget.min) {
      parts.push(`above $${intent.budget.min.toLocaleString()}`);
    }
  }

  if (intent.location) {
    parts.push(`in ${intent.location}`);
  }

  if (intent.amenities && intent.amenities.length > 0) {
    parts.push(`with ${intent.amenities.join(', ')}`);
  }

  if (intent.keywords.length > 0) {
    parts.push(`matching: ${intent.keywords.join(', ')}`);
  }

  return parts.length > 0
    ? `Searching for: ${parts.join(' ')}`
    : `Searching for: ${intent.rawQuery}`;
}
