/**
 * Semantic Search API
 * Uses OpenAI embeddings and pgvector for natural language package search
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { generateEmbedding, enhanceSearchQuery } from '@/lib/openai/embeddings';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('q');
    const threshold = parseFloat(searchParams.get('threshold') || '0.5');
    const limit = parseInt(searchParams.get('limit') || '20');

    if (!query || query.trim().length === 0) {
      return NextResponse.json(
        { error: 'Search query is required' },
        { status: 400 }
      );
    }

    // Generate embedding for the search query
    const enhancedQuery = enhanceSearchQuery(query);
    const queryEmbedding = await generateEmbedding(enhancedQuery);

    // Perform semantic search using pgvector
    const { data: packages, error: searchError } = await supabase.rpc(
      'search_packages_semantic',
      {
        query_embedding: queryEmbedding,
        match_threshold: threshold,
        match_count: limit,
      }
    );

    if (searchError) {
      console.error('Semantic search error:', searchError);
      return NextResponse.json(
        { error: 'Search failed', details: searchError.message },
        { status: 500 }
      );
    }

    // Fetch vendor information for each package
    const packageIds = packages?.map((pkg: any) => pkg.vendor_id) || [];

    if (packageIds.length === 0) {
      return NextResponse.json({
        packages: [],
        count: 0,
        query: query,
      });
    }

    const { data: vendors, error: vendorError } = await supabase
      .from('vendors')
      .select('id, business_name, location_address, location_lat, location_lng')
      .in('id', packageIds)
      .eq('status', 'verified');

    if (vendorError) {
      console.error('Vendor fetch error:', vendorError);
    }

    // Create vendor lookup map
    const vendorMap = new Map(
      vendors?.map((v: any) => [v.id, v]) || []
    );

    // Enrich packages with vendor data
    const enrichedPackages = packages?.map((pkg: any) => ({
      ...pkg,
      vendor: vendorMap.get(pkg.vendor_id),
    })) || [];

    return NextResponse.json({
      packages: enrichedPackages,
      count: enrichedPackages.length,
      query: query,
    });
  } catch (error: any) {
    console.error('Semantic search API error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error.message,
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}

/**
 * POST endpoint to generate/update embeddings for a package
 * Called when a package is created or updated
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const body = await request.json();
    const { packageId, searchText } = body;

    if (!packageId || !searchText) {
      return NextResponse.json(
        { error: 'packageId and searchText are required' },
        { status: 400 }
      );
    }

    // Generate embedding
    const embedding = await generateEmbedding(searchText);

    // Update package with embedding
    const { error: updateError } = await supabase
      .from('packages')
      .update({ embedding })
      .eq('id', packageId);

    if (updateError) {
      console.error('Failed to update package embedding:', updateError);
      return NextResponse.json(
        { error: 'Failed to update embedding', details: updateError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Embedding generated and saved'
    });
  } catch (error: any) {
    console.error('Embedding generation API error:', error);
    return NextResponse.json(
      { error: 'Internal server error', message: error.message },
      { status: 500 }
    );
  }
}
