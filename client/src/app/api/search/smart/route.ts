/**
 * Smart Search API
 * Uses GPT-4 to extract structured parameters from natural language,
 * then performs hybrid search combining vector similarity + filters
 *
 * POST /api/search/smart
 * Body: { query: string, limit?: number, threshold?: number }
 *
 * This is the recommended endpoint for natural language search
 */

import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { z } from 'zod';
import {
  generateEmbedding,
  extractParametersWithGPT,
  expandQuery,
} from '@/lib/ai/embeddings';
import { preprocessQuery } from '@/lib/ai/query-preprocessing';
import { rerankResults, explainRanking, diversifyResults } from '@/lib/ai/reranking';
import { generateDidYouMean, generateRelatedSearches, analyzeSearchQuality } from '@/lib/ai/suggestions';

// Request validation schema
const smartSearchSchema = z.object({
  query: z.string().min(2).max(500), // Lowered from 10 to 2 for short queries
  limit: z.number().int().min(1).max(100).optional().default(50),
  threshold: z.number().min(0).max(1).optional().default(0.3), // Lowered from 0.5 to 0.3 for better recall
  useExpansion: z.boolean().optional().default(true), // Enable query expansion by default
  useReranking: z.boolean().optional().default(true), // Enable reranking by default
  useDiversify: z.boolean().optional().default(false), // Diversity optional
  includeSuggestions: z.boolean().optional().default(true), // Include search suggestions
});

export async function POST(request: Request) {
  try {
    // Parse and validate request body
    const body = await request.json();
    const { query, limit, threshold, useExpansion, useReranking, useDiversify, includeSuggestions } = smartSearchSchema.parse(body);

    console.log('🧠 Smart search query:', query);

    // Step 1: Preprocess query (typo correction, normalization, entity extraction)
    console.log('🔧 Preprocessing query...');
    const preprocessed = preprocessQuery(query);
    console.log('📊 Preprocessed:', {
      corrected: preprocessed.corrected,
      price: preprocessed.priceRange,
      guests: preprocessed.guestCount,
      location: preprocessed.location,
    });

    // Step 2: Expand query with related terms (if enabled)
    // Use corrected query with synonyms for expansion
    const queryForExpansion = preprocessed.withSynonyms;
    let expandedQuery = queryForExpansion;
    if (useExpansion) {
      console.log('🔍 Expanding query with related terms...');
      expandedQuery = await expandQuery(queryForExpansion);
      console.log('📝 Expanded query:', expandedQuery);
    }

    // Step 3: Extract structured parameters using GPT (use original for better context)
    console.log('🤖 Extracting parameters with GPT...');
    const extractedParams = await extractParametersWithGPT(query);

    // Merge with preprocessing results (preprocessing takes precedence for explicit values)
    if (preprocessed.priceRange?.max && !extractedParams.budget_max) {
      extractedParams.budget_max = preprocessed.priceRange.max;
    }
    if (preprocessed.guestCount && !extractedParams.capacity_min) {
      extractedParams.capacity_min = preprocessed.guestCount;
    }
    if (preprocessed.location && !extractedParams.location) {
      extractedParams.location = preprocessed.location;
    }

    console.log('📊 Final extracted parameters:', extractedParams);

    // Step 4: Generate embedding for semantic search (using expanded query)
    console.log('🤖 Generating query embedding...');
    const queryEmbedding = await generateEmbedding(expandedQuery);

    // Step 5: Create Supabase client
    const supabase = createRouteHandlerClient({ cookies });

    // Step 6: Perform hybrid search with extracted parameters
    console.log('🗄️ Performing smart hybrid search...');
    const { data: packages, error } = await supabase.rpc(
      'hybrid_search_packages',
      {
        query_embedding: queryEmbedding,
        budget_max: extractedParams.budget_max,
        capacity_min: extractedParams.capacity_min,
        location_filter: extractedParams.location,
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

    // Step 7: Rerank results for improved relevance (if enabled)
    let finalResults = packages || [];
    if (useReranking && finalResults.length > 0) {
      console.log('🎯 Reranking results...');
      finalResults = rerankResults(finalResults, query, {
        budget: extractedParams.budget_max,
        guestCount: extractedParams.capacity_min,
        foodType: extractedParams.food_type,
        venueType: extractedParams.venue_type,
      });

      // Add ranking explanations
      finalResults = finalResults.map(pkg => ({
        ...pkg,
        ranking_explanation: explainRanking(pkg),
      }));

      console.log('✅ Reranking complete');
    }

    // Step 8: Diversify results if requested
    if (useDiversify && finalResults.length > limit) {
      console.log('🌈 Diversifying results...');
      finalResults = diversifyResults(finalResults, limit);
    }

    // Step 9: Limit results
    finalResults = finalResults.slice(0, limit);

    // Step 10: Generate suggestions if enabled and results are poor
    let didYouMean: string[] = [];
    let relatedSearches: string[] = [];
    let searchQuality = null;

    if (includeSuggestions) {
      console.log('💡 Generating search suggestions...');

      // Analyze search quality
      searchQuality = analyzeSearchQuality(query, finalResults.length, extractedParams);

      // Generate "Did you mean?" if results are poor
      if (finalResults.length < 3) {
        didYouMean = await generateDidYouMean(query, finalResults.length);
      }

      // Always generate related searches
      relatedSearches = await generateRelatedSearches(query);

      console.log('✅ Suggestions generated');
    }

    // Step 11: Save search to history (for analytics)
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
          extracted_params: extractedParams,
          result_count: packages?.length || 0,
        })
        .then(({ error: historyError }) => {
          if (historyError) {
            console.warn('Failed to save search history:', historyError);
          }
        });
    }

    // Step 12: Return results with extracted parameters for UI display
    return NextResponse.json({
      data: {
        results: finalResults,
        count: finalResults.length,
        totalMatches: packages?.length || 0, // Total before reranking
        query: query,
        correctedQuery: preprocessed.corrected !== preprocessed.normalized ? preprocessed.corrected : null,
        expandedQuery: useExpansion ? expandedQuery : null,
        extractedParams: extractedParams,
        threshold: threshold,
        reranked: useReranking,
        diversified: useDiversify,
        // Search suggestions
        didYouMean: didYouMean.length > 0 ? didYouMean : null,
        relatedSearches: relatedSearches.length > 0 ? relatedSearches : null,
        searchQuality: searchQuality,
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
    if (error instanceof Error && error.message.includes('OpenAI')) {
      console.error('OpenAI error:', error);
      return NextResponse.json(
        {
          data: null,
          error: {
            message: 'Failed to process query. Please try again.',
            code: 'AI_ERROR',
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
