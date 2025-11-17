/**
 * Hybrid Search API
 * Combines vector similarity search with structured filters
 *
 * POST /api/search/hybrid
 * Body: {
 *   query: string,
 *   budget_max?: number,
 *   capacity_min?: number,
 *   location?: string,
 *   limit?: number,
 *   threshold?: number
 * }
 */

import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { z } from 'zod';
import { generateEmbedding } from '@/lib/ai/embeddings';

// Request validation schema
const hybridSearchSchema = z.object({
  query: z.string().min(10).max(500),
  budget_max: z.number().int().positive().optional(),
  capacity_min: z.number().int().positive().optional(),
  location: z.string().optional(),
  limit: z.number().int().min(1).max(100).optional().default(50),
  threshold: z.number().min(0).max(1).optional().default(0.5),
});

export async function POST(request: Request) {
  try {
    // Parse and validate request body
    const body = await request.json();
    const { query, budget_max, capacity_min, location, limit, threshold } =
      hybridSearchSchema.parse(body);

    console.log('🔍 Hybrid search query:', query);
    console.log('📊 Filters:', { budget_max, capacity_min, location });

    // Generate embedding for user query
    console.log('🤖 Generating query embedding...');
    const queryEmbedding = await generateEmbedding(query);

    // Create Supabase client
    const supabase = createRouteHandlerClient({ cookies });

    // Perform hybrid search (vector + filters) using RPC function
    console.log('🗄️ Performing hybrid search...');
    const { data: packages, error } = await supabase.rpc(
      'hybrid_search_packages',
      {
        query_embedding: queryEmbedding,
        budget_max: budget_max || null,
        capacity_min: capacity_min || null,
        location_filter: location || null,
        match_threshold: threshold,
        match_count: limit,
      }
    );

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

    // Optionally save search to history (for analytics)
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      // Non-blocking save to search_history table
      supabase
        .from('search_history')
        .insert({
          user_id: user.id,
          query: query,
          extracted_params: {
            budget_max,
            capacity_min,
            location,
          },
          result_count: packages?.length || 0,
        })
        .then(({ error: historyError }) => {
          if (historyError) {
            console.warn('Failed to save search history:', historyError);
          }
        });
    }

    // Return results with metadata
    return NextResponse.json({
      data: {
        results: packages || [],
        count: packages?.length || 0,
        query: query,
        filters: {
          budget_max,
          capacity_min,
          location,
        },
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
