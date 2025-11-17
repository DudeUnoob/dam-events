import { NextRequest, NextResponse } from 'next/server';
import { searchPackages } from '@/lib/rag/search-service';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { query, filters, matchThreshold, matchCount } = body;
    
    if (!query || typeof query !== 'string') {
      return NextResponse.json(
        { error: 'Query is required and must be a string' },
        { status: 400 }
      );
    }
    
    const results = await searchPackages({
      query,
      filters,
      matchThreshold,
      matchCount,
    });
    
    return NextResponse.json({ 
      success: true, 
      results,
      count: results.length 
    });
    
  } catch (error) {
    console.error('Search API error:', error);
    return NextResponse.json(
      { error: 'Internal server error', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');
    
    if (!query) {
      return NextResponse.json(
        { error: 'Query parameter "q" is required' },
        { status: 400 }
      );
    }
    
    const results = await searchPackages({ query });
    
    return NextResponse.json({ 
      success: true, 
      results,
      count: results.length 
    });
    
  } catch (error) {
    console.error('Search API error:', error);
    return NextResponse.json(
      { error: 'Internal server error', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

