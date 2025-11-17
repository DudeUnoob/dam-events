/**
 * Semantic Search API
 * Pure vector similarity search using OpenAI embeddings
 *
 * POST /api/search/semantic
 * Body: { query: string, limit?: number, threshold?: number }
 */

import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { z } from 'zod';
import { generateEmbedding, expandQuery } from '@/lib/ai/embeddings';

// Request validation schema
const searchSchema = z.object({
  query: z.string().min(2).max(500), // Lowered from 10 to 2
  limit: z.number().int().min(1).max(100).optional().default(50),
  threshold: z.number().min(0).max(1).optional().default(0.3), // Lowered from 0.5 to 0.3
  useExpansion: z.boolean().optional().default(true),
});

export async function POST(request: Request) {
  try {
    // Parse and validate request body
    const body = await request.json();
    const { query, limit, threshold, useExpansion } = searchSchema.parse(body);

    console.log('🔍 Semantic search query:', query);

    // Expand query with related terms (if enabled)
    let expandedQuery = query;
    if (useExpansion) {
      console.log('🔍 Expanding query with related terms...');
      expandedQuery = await expandQuery(query);
      console.log('📝 Expanded query:', expandedQuery);
    }

    // Generate embedding for user query
    console.log('🤖 Generating query embedding...');
    const queryEmbedding = await generateEmbedding(expandedQuery);

    // Create Supabase client
    const supabase = createRouteHandlerClient({ cookies });

    // Perform vector similarity search using RPC function
    console.log('🗄️ Performing vector similarity search...');
    const { data: packages, error } = await supabase.rpc('match_packages', {
      query_embedding: queryEmbedding,
      match_threshold: threshold,
      match_count: limit,
    });

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        {
          data: null,
          error: {
            message: 'Failed to search packages',
            code: 'DB_ERROR',
          },
        },
        { status: 500 }
      );
    }

    console.log(`✅ Found ${packages?.length || 0} matching packages`);

    // Return results with metadata
    return NextResponse.json({
      data: {
        results: packages || [],
        count: packages?.length || 0,
        query: query,
        expandedQuery: useExpansion ? expandedQuery : null,
        threshold: threshold,
      },
      error: null,
    });
  } catch (error) {
    // Handle validation errors
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          data: null,
          error: {
            message: 'Invalid request',
            code: 'VALIDATION_ERROR',
            details: error.errors,
          },
        },
        { status: 400 }
      );
    }

    // Handle OpenAI API errors
    if (error instanceof Error && error.message.includes('embedding')) {
      console.error('OpenAI error:', error);
      return NextResponse.json(
        {
          data: null,
          error: {
            message: 'Failed to generate query embedding. Please try again.',
            code: 'EMBEDDING_ERROR',
          },
        },
        { status: 500 }
      );
    }

    // Generic error handler
    console.error('Unexpected error:', error);
    return NextResponse.json(
      {
        data: null,
        error: {
          message: 'Internal server error',
          code: 'INTERNAL_ERROR',
        },
      },
      { status: 500 }
    );
  }
}
