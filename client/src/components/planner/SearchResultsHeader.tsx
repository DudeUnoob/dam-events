'use client';

/**
 * Search Results Header Component
 * Displays extracted parameters as removable tags and result count
 */

import { X, MapPin, DollarSign, Users, Utensils, Calendar, Home } from 'lucide-react';

export interface SearchParams {
  budget_max?: number | null;
  capacity_min?: number | null;
  location?: string | null;
  food_type?: string | null;
  event_type?: string | null;
  venue_type?: string | null;
}

interface SearchResultsHeaderProps {
  query: string;
  resultCount: number;
  extractedParams?: SearchParams;
  onRemoveParam?: (paramKey: keyof SearchParams) => void;
  onClearAll?: () => void;
}

export function SearchResultsHeader({
  query,
  resultCount,
  extractedParams,
  onRemoveParam,
  onClearAll,
}: SearchResultsHeaderProps) {
  // Filter out null/undefined params
  const activeParams = extractedParams
    ? Object.entries(extractedParams).filter(([_, value]) => value != null)
    : [];

  const hasParams = activeParams.length > 0;

  // Get icon for parameter type
  const getParamIcon = (key: string) => {
    switch (key) {
      case 'location':
        return <MapPin className="h-3 w-3" />;
      case 'budget_max':
        return <DollarSign className="h-3 w-3" />;
      case 'capacity_min':
        return <Users className="h-3 w-3" />;
      case 'food_type':
        return <Utensils className="h-3 w-3" />;
      case 'event_type':
        return <Calendar className="h-3 w-3" />;
      case 'venue_type':
        return <Home className="h-3 w-3" />;
      default:
        return null;
    }
  };

  // Format parameter value for display
  const formatParamValue = (key: string, value: any): string => {
    switch (key) {
      case 'budget_max':
        return `$${value.toLocaleString()} max`;
      case 'capacity_min':
        return `${value}+ people`;
      case 'location':
        return String(value);
      case 'food_type':
        return `${value} cuisine`;
      case 'event_type':
        return String(value);
      case 'venue_type':
        return `${value} venue`;
      default:
        return String(value);
    }
  };

  // Get human-readable label for parameter
  const getParamLabel = (key: string): string => {
    switch (key) {
      case 'budget_max':
        return 'Budget';
      case 'capacity_min':
        return 'Capacity';
      case 'location':
        return 'Location';
      case 'food_type':
        return 'Food';
      case 'event_type':
        return 'Event';
      case 'venue_type':
        return 'Venue';
      default:
        return key;
    }
  };

  return (
    <div className="space-y-3 rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-medium text-slate-600">
            Search Results for:
          </h2>
          <p className="mt-1 text-lg font-semibold text-slate-900">
            {query}
          </p>
        </div>

        {/* Clear All Button */}
        {hasParams && onClearAll && (
          <button
            onClick={onClearAll}
            className="rounded-md px-3 py-1.5 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100"
            type="button"
          >
            Clear all filters
          </button>
        )}
      </div>

      {/* Extracted Parameters as Tags */}
      {hasParams && (
        <div className="flex flex-wrap gap-2">
          {activeParams.map(([key, value]) => (
            <div
              key={key}
              className="flex items-center gap-1.5 rounded-full border border-blue-200 bg-blue-50 px-3 py-1.5 text-sm"
            >
              <span className="text-blue-700">
                {getParamIcon(key)}
              </span>
              <span className="font-medium text-blue-900">
                {getParamLabel(key)}:
              </span>
              <span className="text-blue-700">
                {formatParamValue(key, value)}
              </span>

              {/* Remove Tag Button */}
              {onRemoveParam && (
                <button
                  onClick={() => onRemoveParam(key as keyof SearchParams)}
                  className="ml-1 rounded-full p-0.5 text-blue-700 transition-colors hover:bg-blue-200"
                  type="button"
                  aria-label={`Remove ${getParamLabel(key)} filter`}
                >
                  <X className="h-3 w-3" />
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Result Count */}
      <div className="flex items-center justify-between border-t border-slate-200 pt-3">
        <p className="text-sm text-slate-600">
          {resultCount === 0 ? (
            <span className="font-medium text-slate-900">
              No packages found
            </span>
          ) : resultCount === 1 ? (
            <>
              <span className="font-semibold text-slate-900">1</span> package
              found
            </>
          ) : (
            <>
              <span className="font-semibold text-slate-900">
                {resultCount}
              </span>{' '}
              packages found
            </>
          )}
        </p>

        {/* Relevance indicator (optional) */}
        {resultCount > 0 && (
          <p className="text-xs text-slate-500">
            Sorted by relevance
          </p>
        )}
      </div>

      {/* No Results Message */}
      {resultCount === 0 && (
        <div className="rounded-md bg-slate-50 p-4">
          <p className="text-sm font-medium text-slate-900">
            No packages match your search
          </p>
          <p className="mt-1 text-sm text-slate-600">
            Try broadening your criteria:
          </p>
          <ul className="mt-2 list-inside list-disc space-y-1 text-sm text-slate-600">
            {extractedParams?.budget_max && (
              <li>Increase your budget limit</li>
            )}
            {extractedParams?.capacity_min && (
              <li>Look for smaller capacity venues</li>
            )}
            {extractedParams?.location && (
              <li>Expand your location search area</li>
            )}
            {!hasParams && (
              <li>Try using different keywords or be more specific</li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
