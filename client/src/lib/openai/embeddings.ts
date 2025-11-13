/**
 * OpenAI Embeddings Service
 * Generates vector embeddings for semantic search
 */

import OpenAI from 'openai';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Model configuration
const EMBEDDING_MODEL = 'text-embedding-3-small'; // 1536 dimensions
const MAX_TOKENS = 8191; // Max tokens for this model

/**
 * Generate embedding vector for a text string
 */
export async function generateEmbedding(text: string): Promise<number[]> {
  try {
    // Truncate text if too long (rough estimate: 1 token ≈ 4 chars)
    const truncatedText = text.slice(0, MAX_TOKENS * 4);

    const response = await openai.embeddings.create({
      model: EMBEDDING_MODEL,
      input: truncatedText,
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
 */
export async function generateEmbeddings(texts: string[]): Promise<number[][]> {
  try {
    // Truncate all texts
    const truncatedTexts = texts.map(text => text.slice(0, MAX_TOKENS * 4));

    const response = await openai.embeddings.create({
      model: EMBEDDING_MODEL,
      input: truncatedTexts,
      encoding_format: 'float',
    });

    return response.data.map(item => item.embedding);
  } catch (error) {
    console.error('Error generating embeddings:', error);
    throw new Error('Failed to generate embeddings');
  }
}

/**
 * Create searchable text from package data
 */
export function createPackageSearchText(packageData: {
  name: string;
  description: string;
  venue_details?: {
    name?: string;
    amenities?: string[];
  };
  catering_details?: {
    menu_options?: string[];
    dietary_accommodations?: string[];
  };
  entertainment_details?: {
    type?: string;
    equipment?: string[];
  };
  price_min: number;
  price_max: number;
  capacity: number;
}): string {
  const parts: string[] = [];

  // Basic info
  parts.push(packageData.name);
  parts.push(packageData.description);

  // Venue details
  if (packageData.venue_details) {
    if (packageData.venue_details.name) {
      parts.push(`Venue: ${packageData.venue_details.name}`);
    }
    if (packageData.venue_details.amenities?.length) {
      parts.push(`Amenities: ${packageData.venue_details.amenities.join(', ')}`);
    }
  }

  // Catering details
  if (packageData.catering_details) {
    if (packageData.catering_details.menu_options?.length) {
      parts.push(`Menu: ${packageData.catering_details.menu_options.join(', ')}`);
    }
    if (packageData.catering_details.dietary_accommodations?.length) {
      parts.push(`Dietary: ${packageData.catering_details.dietary_accommodations.join(', ')}`);
    }
  }

  // Entertainment details
  if (packageData.entertainment_details) {
    if (packageData.entertainment_details.type) {
      parts.push(`Entertainment: ${packageData.entertainment_details.type}`);
    }
    if (packageData.entertainment_details.equipment?.length) {
      parts.push(`Equipment: ${packageData.entertainment_details.equipment.join(', ')}`);
    }
  }

  // Numerical details
  parts.push(`Capacity: ${packageData.capacity} guests`);
  parts.push(`Price: $${packageData.price_min} to $${packageData.price_max}`);

  return parts.join('. ');
}

/**
 * Enhance search query with context for better embeddings
 */
export function enhanceSearchQuery(query: string): string {
  // Add context to help the embedding model understand this is an event search
  return `Event package search: ${query}`;
}
