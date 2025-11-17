// /client/src/lib/embeddings.ts
import { pipeline, env } from '@xenova/transformers';

// Config to use hosted models
// @ts-ignore - env properties may not be fully typed
env.remoteURL = 'https://huggingface.co/Xenova/transformers.js/resolve/main/';
// @ts-ignore
env.allowLocalModels = false;

// Create a singleton instance of the pipeline
class EmbeddingPipeline {
  static task = 'feature-extraction' as const;
  static model = 'Xenova/all-MiniLM-L6-v2';
  static instance: any = null;

  static async getInstance() {
    if (this.instance === null) {
      // @ts-ignore - pipeline types may not match exactly
      this.instance = await pipeline(this.task, this.model);
    }
    return this.instance;
  }
}

/**
 * Normalize text for better embedding quality
 */
export function normalizeTextForEmbedding(text: string): string {
  return text
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 512); // Limit to 512 chars for performance
}

/**
 * Generates an embedding for a given text using a free, local model.
 * @param text The text to embed.
 * @returns A 384-dimension vector.
 */
export async function getEmbedding(text: string): Promise<number[]> {
  const extractor = await EmbeddingPipeline.getInstance();

  // Normalize text before embedding
  const normalizedText = normalizeTextForEmbedding(text);

  // Generate embedding
  const result = await extractor(normalizedText, {
    pooling: 'mean',
    normalize: true,
  });

  // Convert Float32Array to a regular array
  return Array.from(result.data);
}

/**
 * Batch generate embeddings for multiple texts
 */
export async function getBatchEmbeddings(texts: string[]): Promise<number[][]> {
  const extractor = await EmbeddingPipeline.getInstance();
  const embeddings: number[][] = [];
  
  for (const text of texts) {
    const normalizedText = normalizeTextForEmbedding(text);
    const result = await extractor(normalizedText, {
      pooling: 'mean',
      normalize: true,
    });
    embeddings.push(Array.from(result.data));
  }
  
  return embeddings;
}

