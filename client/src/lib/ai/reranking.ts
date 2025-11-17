/**
 * Search Result Reranking Utilities
 * Reranks search results based on multiple relevance signals
 */

interface PackageResult {
  id: string;
  name: string;
  description: string;
  search_description: string;
  price_min: number;
  price_max: number;
  capacity: number;
  similarity: number; // Cosine similarity from vector search
  catering_details?: any;
  venue_details?: any;
  entertainment_details?: any;
  [key: string]: any;
}

interface RerankingParams {
  budget?: number | null;
  guestCount?: number | null;
  foodType?: string | null;
  venueType?: string | null;
}

/**
 * Calculate keyword overlap score between query and package
 * Boosted BM25-like scoring without needing database BM25
 */
function calculateKeywordScore(
  query: string,
  packageText: string
): number {
  const queryWords = query.toLowerCase().split(/\s+/);
  const packageWords = packageText.toLowerCase().split(/\s+/);
  const packageWordSet = new Set(packageWords);

  let matchCount = 0;
  let exactPhraseBoost = 0;

  // Count keyword matches
  queryWords.forEach(word => {
    if (word.length > 3 && packageWordSet.has(word)) {
      matchCount++;
    }
  });

  // Check for exact phrase matches (strong signal)
  const queryLower = query.toLowerCase();
  const packageLower = packageText.toLowerCase();
  if (packageLower.includes(queryLower)) {
    exactPhraseBoost = 0.5;
  }

  // Normalize by query length
  const score = (matchCount / Math.max(queryWords.length, 1)) + exactPhraseBoost;
  return Math.min(score, 1.0); // Cap at 1.0
}

/**
 * Calculate budget match score
 */
function calculateBudgetScore(
  packagePriceMin: number,
  packagePriceMax: number,
  budget: number
): number {
  // Perfect match: budget falls within package range
  if (budget >= packagePriceMin && budget <= packagePriceMax) {
    return 1.0;
  }

  // Partial match: budget is close
  const packageMid = (packagePriceMin + packagePriceMax) / 2;
  const diff = Math.abs(packageMid - budget);
  const diffPercent = diff / budget;

  // Decay score based on percentage difference
  if (diffPercent <= 0.1) return 0.9; // Within 10%
  if (diffPercent <= 0.2) return 0.7; // Within 20%
  if (diffPercent <= 0.3) return 0.5; // Within 30%
  if (diffPercent <= 0.5) return 0.3; // Within 50%
  return 0.1; // More than 50% off
}

/**
 * Calculate capacity match score
 */
function calculateCapacityScore(
  packageCapacity: number,
  guestCount: number
): number {
  // Perfect match: capacity is 1-1.5x guest count (ideal range)
  const ratio = packageCapacity / guestCount;

  if (ratio >= 1.0 && ratio <= 1.5) {
    return 1.0; // Perfect fit
  } else if (ratio >= 0.8 && ratio < 1.0) {
    return 0.7; // Slightly too small (might work)
  } else if (ratio > 1.5 && ratio <= 2.0) {
    return 0.8; // Slightly too large (still good)
  } else if (ratio > 2.0 && ratio <= 3.0) {
    return 0.5; // Much larger (wasteful but works)
  } else if (ratio < 0.8) {
    return 0.2; // Too small (probably won't work)
  }
  return 0.1; // Way too large (not cost effective)
}

/**
 * Calculate food type match score
 */
function calculateFoodTypeScore(
  packageCateringDetails: any,
  foodType: string
): number {
  if (!packageCateringDetails) return 0;

  const foodTypeLower = foodType.toLowerCase();
  const cateringText = JSON.stringify(packageCateringDetails).toLowerCase();

  // Check for exact matches in menu options, cuisine type, etc.
  if (cateringText.includes(foodTypeLower)) {
    return 1.0;
  }

  // Check for partial matches (e.g., "seafood" matches "sea" or "fish")
  const foodWords = foodTypeLower.split(/\s+/);
  let partialMatchCount = 0;
  foodWords.forEach(word => {
    if (word.length > 3 && cateringText.includes(word)) {
      partialMatchCount++;
    }
  });

  if (partialMatchCount > 0) {
    return 0.5 + (partialMatchCount / foodWords.length) * 0.5;
  }

  return 0;
}

/**
 * Calculate venue type match score
 */
function calculateVenueTypeScore(
  packageVenueDetails: any,
  venueType: string
): number {
  if (!packageVenueDetails) return 0;

  const venueTypeLower = venueType.toLowerCase();
  const venueText = JSON.stringify(packageVenueDetails).toLowerCase();

  // Check for exact matches
  if (venueText.includes(venueTypeLower)) {
    return 1.0;
  }

  // Check for partial matches
  const venueWords = venueTypeLower.split(/\s+/);
  let partialMatchCount = 0;
  venueWords.forEach(word => {
    if (word.length > 3 && venueText.includes(word)) {
      partialMatchCount++;
    }
  });

  if (partialMatchCount > 0) {
    return 0.5 + (partialMatchCount / venueWords.length) * 0.5;
  }

  return 0;
}

/**
 * Rerank search results based on multiple relevance signals
 */
export function rerankResults(
  results: PackageResult[],
  query: string,
  params: RerankingParams = {}
): PackageResult[] {
  const rankedResults = results.map(pkg => {
    // Start with vector similarity score (0-1)
    let finalScore = (pkg.similarity || 0) * 0.4; // 40% weight

    // Add keyword matching score (0-1)
    const keywordScore = calculateKeywordScore(
      query,
      pkg.search_description || `${pkg.name} ${pkg.description}`
    );
    finalScore += keywordScore * 0.2; // 20% weight

    // Add budget match score (if budget provided)
    if (params.budget) {
      const budgetScore = calculateBudgetScore(
        pkg.price_min,
        pkg.price_max,
        params.budget
      );
      finalScore += budgetScore * 0.15; // 15% weight
    }

    // Add capacity match score (if guest count provided)
    if (params.guestCount) {
      const capacityScore = calculateCapacityScore(
        pkg.capacity,
        params.guestCount
      );
      finalScore += capacityScore * 0.15; // 15% weight
    }

    // Add food type match score (if food type provided)
    if (params.foodType) {
      const foodScore = calculateFoodTypeScore(
        pkg.catering_details,
        params.foodType
      );
      finalScore += foodScore * 0.05; // 5% weight
    }

    // Add venue type match score (if venue type provided)
    if (params.venueType) {
      const venueScore = calculateVenueTypeScore(
        pkg.venue_details,
        params.venueType
      );
      finalScore += venueScore * 0.05; // 5% weight
    }

    return {
      ...pkg,
      rerank_score: finalScore,
      scores: {
        similarity: pkg.similarity || 0,
        keyword: keywordScore,
        budget: params.budget ? calculateBudgetScore(pkg.price_min, pkg.price_max, params.budget) : null,
        capacity: params.guestCount ? calculateCapacityScore(pkg.capacity, params.guestCount) : null,
        foodType: params.foodType ? calculateFoodTypeScore(pkg.catering_details, params.foodType) : null,
        venueType: params.venueType ? calculateVenueTypeScore(pkg.venue_details, params.venueType) : null,
      },
    };
  });

  // Sort by final reranking score (descending)
  rankedResults.sort((a, b) => (b.rerank_score || 0) - (a.rerank_score || 0));

  return rankedResults;
}

/**
 * Generate explanation for why a package was ranked highly
 */
export function explainRanking(pkg: any): string[] {
  const explanations: string[] = [];

  if (pkg.scores) {
    if (pkg.scores.similarity > 0.7) {
      explanations.push('Highly relevant to your search');
    }

    if (pkg.scores.keyword > 0.5) {
      explanations.push('Contains your search keywords');
    }

    if (pkg.scores.budget && pkg.scores.budget > 0.7) {
      explanations.push('Matches your budget');
    }

    if (pkg.scores.capacity && pkg.scores.capacity > 0.7) {
      explanations.push('Perfect capacity for your guest count');
    }

    if (pkg.scores.foodType && pkg.scores.foodType > 0.7) {
      explanations.push('Offers your preferred food type');
    }

    if (pkg.scores.venueType && pkg.scores.venueType > 0.7) {
      explanations.push('Matches your venue preference');
    }
  }

  return explanations.length > 0 ? explanations : ['Recommended based on your search'];
}

/**
 * Diversity-aware reranking to avoid too many similar results
 * Ensures variety in price ranges, venue types, etc.
 */
export function diversifyResults(
  results: PackageResult[],
  topK: number = 20
): PackageResult[] {
  if (results.length <= topK) return results;

  const diversified: PackageResult[] = [];
  const usedVenueTypes = new Set<string>();
  const usedPriceRanges = new Set<string>();

  // First pass: Add top results while maintaining diversity
  for (const result of results) {
    if (diversified.length >= topK) break;

    const venueType = result.venue_details?.type || 'unknown';
    const priceRange = getPriceRange(result.price_min, result.price_max);

    // Always add the first few top results
    if (diversified.length < 3) {
      diversified.push(result);
      usedVenueTypes.add(venueType);
      usedPriceRanges.add(priceRange);
      continue;
    }

    // For remaining slots, prefer diversity
    const isNewVenueType = !usedVenueTypes.has(venueType);
    const isNewPriceRange = !usedPriceRanges.has(priceRange);

    if (isNewVenueType || isNewPriceRange) {
      diversified.push(result);
      usedVenueTypes.add(venueType);
      usedPriceRanges.add(priceRange);
    } else if (diversified.length < topK * 0.8) {
      // Still add if we haven't filled 80% of slots
      diversified.push(result);
    }
  }

  // Second pass: Fill remaining slots with best remaining results
  for (const result of results) {
    if (diversified.length >= topK) break;
    if (!diversified.includes(result)) {
      diversified.push(result);
    }
  }

  return diversified;
}

function getPriceRange(min: number, max: number): string {
  const avg = (min + max) / 2;
  if (avg < 2000) return 'budget';
  if (avg < 5000) return 'mid-range';
  if (avg < 10000) return 'premium';
  return 'luxury';
}
