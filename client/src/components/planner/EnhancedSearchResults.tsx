'use client';

/**
 * Enhanced Search Results Component
 * Displays search metadata including suggestions, quality analysis, and explanations
 */

import { AlertCircle, Lightbulb, TrendingUp, Info, Sparkles } from 'lucide-react';

export interface SearchMetadata {
  correctedQuery?: string | null;
  expandedQuery?: string | null;
  didYouMean?: string[] | null;
  relatedSearches?: string[] | null;
  searchQuality?: {
    score: number;
    issues: string[];
    suggestions: string[];
  } | null;
  totalMatches?: number;
}

interface EnhancedSearchResultsProps {
  metadata: SearchMetadata;
  resultCount: number;
  onSuggestionClick?: (query: string) => void;
}

export function EnhancedSearchResults({
  metadata,
  resultCount,
  onSuggestionClick,
}: EnhancedSearchResultsProps) {
  const {
    correctedQuery,
    expandedQuery,
    didYouMean,
    relatedSearches,
    searchQuality,
    totalMatches,
  } = metadata;

  // Don't render if no enhanced data to show
  const hasEnhancedData =
    correctedQuery ||
    (didYouMean && didYouMean.length > 0) ||
    (relatedSearches && relatedSearches.length > 0) ||
    searchQuality;

  if (!hasEnhancedData) {
    return null;
  }

  return (
    <div className="space-y-3">
      {/* Query Correction */}
      {correctedQuery && (
        <div className="rounded-lg border border-blue-200 bg-blue-50 p-3">
          <div className="flex items-start gap-2">
            <Info className="mt-0.5 h-4 w-4 flex-shrink-0 text-blue-600" />
            <div className="flex-1">
              <p className="text-sm font-medium text-blue-900">
                Showing results for: <span className="font-semibold">{correctedQuery}</span>
              </p>
              <p className="mt-0.5 text-xs text-blue-700">
                We corrected potential typos in your query
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Search Quality Analysis */}
      {searchQuality && searchQuality.score < 0.7 && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-3">
          <div className="flex items-start gap-2">
            <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-amber-600" />
            <div className="flex-1">
              <p className="text-sm font-medium text-amber-900">
                Search Quality: {Math.round(searchQuality.score * 100)}%
              </p>
              {searchQuality.issues.length > 0 && (
                <p className="mt-1 text-xs text-amber-700">
                  Issues: {searchQuality.issues.join(', ')}
                </p>
              )}
              {searchQuality.suggestions.length > 0 && (
                <p className="mt-1 text-xs text-amber-700">
                  Tip: {searchQuality.suggestions[0]}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Did You Mean Suggestions */}
      {didYouMean && didYouMean.length > 0 && (
        <div className="rounded-lg border border-purple-200 bg-purple-50 p-3">
          <div className="flex items-start gap-2">
            <Sparkles className="mt-0.5 h-4 w-4 flex-shrink-0 text-purple-600" />
            <div className="flex-1">
              <p className="text-sm font-medium text-purple-900">
                Did you mean?
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                {didYouMean.map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() => onSuggestionClick?.(suggestion)}
                    className="rounded-full border border-purple-300 bg-white px-3 py-1 text-xs font-medium text-purple-700 transition-colors hover:bg-purple-100"
                    type="button"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Related Searches */}
      {relatedSearches && relatedSearches.length > 0 && (
        <div className="rounded-lg border border-green-200 bg-green-50 p-3">
          <div className="flex items-start gap-2">
            <TrendingUp className="mt-0.5 h-4 w-4 flex-shrink-0 text-green-600" />
            <div className="flex-1">
              <p className="text-sm font-medium text-green-900">
                Related Searches
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                {relatedSearches.map((related, index) => (
                  <button
                    key={index}
                    onClick={() => onSuggestionClick?.(related)}
                    className="rounded-full border border-green-300 bg-white px-3 py-1 text-xs font-medium text-green-700 transition-colors hover:bg-green-100"
                    type="button"
                  >
                    {related}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* AI Insights (Expanded Query) */}
      {expandedQuery && (
        <details className="group rounded-lg border border-slate-200 bg-slate-50">
          <summary className="cursor-pointer p-3 text-sm font-medium text-slate-700 hover:bg-slate-100">
            <div className="flex items-center gap-2">
              <Lightbulb className="h-4 w-4 text-slate-500" />
              <span>AI Search Insights</span>
              <span className="text-xs text-slate-500">(click to expand)</span>
            </div>
          </summary>
          <div className="border-t border-slate-200 p-3">
            <p className="text-xs font-medium text-slate-600">
              Enhanced search with related terms:
            </p>
            <p className="mt-1 text-xs text-slate-500">
              {expandedQuery}
            </p>
            {totalMatches && totalMatches > resultCount && (
              <p className="mt-2 text-xs text-slate-600">
                Found {totalMatches} total matches, showing top {resultCount}
              </p>
            )}
          </div>
        </details>
      )}
    </div>
  );
}
