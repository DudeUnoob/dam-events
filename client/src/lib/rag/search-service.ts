import { createClient } from '@/lib/supabase/client';
import { getEmbedding, normalizeTextForEmbedding } from '@/lib/embeddings';

export interface RAGSearchOptions {
  query: string;
  matchThreshold?: number;
  matchCount?: number;
  filters?: {
    minCapacity?: number;
    maxPrice?: number;
    serviceTypes?: string[];
  };
}

export interface PackageSearchResult {
  id: string;
  vendor_id: string;
  name: string;
  description: string;
  price_min: number;
  price_max: number;
  capacity: number;
  photos: string[];
  venue_details?: any;
  catering_details?: any;
  entertainment_details?: any;
  similarity: number;
}

export interface VendorSearchResult {
  id: string;
  business_name: string;
  description: string;
  services: string[];
  location_address: string;
  location_lat: number | null;
  location_lng: number | null;
  similarity: number;
}

/**
 * Perform semantic search on packages
 */
export async function searchPackages(
  options: RAGSearchOptions
): Promise<PackageSearchResult[]> {
  const supabase = createClient();
  
  // 1. Generate embedding for query
  const queryEmbedding = await getEmbedding(options.query);
  
  // 2. Determine which RPC function to call
  const useHybridSearch = options.filters && (
    options.filters.minCapacity !== undefined ||
    options.filters.maxPrice !== undefined ||
    (options.filters.serviceTypes && options.filters.serviceTypes.length > 0)
  );
  
  // 3. Call appropriate Supabase RPC function
  const rpcParams: any = {
    query_embedding: queryEmbedding,
    match_threshold: options.matchThreshold || 0.5,
    match_count: options.matchCount || 10,
  };
  
  if (useHybridSearch && options.filters) {
    if (options.filters.minCapacity) {
      rpcParams.min_capacity = options.filters.minCapacity;
    }
    if (options.filters.maxPrice) {
      rpcParams.max_price = options.filters.maxPrice;
    }
    if (options.filters.serviceTypes && options.filters.serviceTypes.length > 0) {
      rpcParams.service_types = options.filters.serviceTypes;
    }
  }
  
  const rpcFunction = useHybridSearch 
    ? 'search_packages_hybrid' 
    : 'search_packages_by_embedding';
  
  const { data, error } = await supabase.rpc(rpcFunction, rpcParams);
  
  if (error) {
    console.error('Search error:', error);
    throw new Error('Failed to perform search');
  }
  
  return data || [];
}

/**
 * Search vendors using semantic search
 */
export async function searchVendors(
  query: string,
  matchThreshold: number = 0.5,
  matchCount: number = 10
): Promise<VendorSearchResult[]> {
  const supabase = createClient();
  const queryEmbedding = await getEmbedding(query);
  
  const { data, error } = await supabase.rpc('search_vendors_by_embedding', {
    query_embedding: queryEmbedding,
    match_threshold: matchThreshold,
    match_count: matchCount,
  });
  
  if (error) {
    console.error('Vendor search error:', error);
    throw new Error('Failed to search vendors');
  }
  
  return data || [];
}

/**
 * Get search suggestions based on partial query
 */
export async function getSearchSuggestions(
  partialQuery: string
): Promise<string[]> {
  if (partialQuery.length < 3) return [];
  
  const supabase = createClient();
  
  // Get common terms from existing packages
  const { data } = await supabase
    .from('packages')
    .select('name, description')
    .ilike('name', `%${partialQuery}%`)
    .limit(5);
    
  return data?.map(p => p.name) || [];
}

