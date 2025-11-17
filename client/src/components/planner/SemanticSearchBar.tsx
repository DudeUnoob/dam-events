'use client';

/**
 * Semantic Search Bar Component
 * Natural language search input with examples and search history
 */

import { useState, useEffect } from 'react';
import { Search, Loader2, History, X } from 'lucide-react';

interface SemanticSearchBarProps {
  onSearch: (query: string) => void;
  isLoading?: boolean;
  placeholder?: string;
}

const EXAMPLE_QUERIES = [
  'Venues in austin under $3000 for 150 people',
  'Outdoor venue with mediterranean food for 100 guests',
  'Budget-friendly packages downtown for 50 people',
  'Wedding venue with catering and live music',
];

export function SemanticSearchBar({
  onSearch,
  isLoading = false,
  placeholder = 'Describe your event... (e.g., "venues in austin under $3000 for 150 people")',
}: SemanticSearchBarProps) {
  const [query, setQuery] = useState('');
  const [showHistory, setShowHistory] = useState(false);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Load search history from localStorage on mount
  useEffect(() => {
    try {
      const history = localStorage.getItem('search_history');
      if (history) {
        setSearchHistory(JSON.parse(history));
      }
    } catch (err) {
      console.error('Failed to load search history:', err);
    }
  }, []);

  // Save to search history
  const addToHistory = (searchQuery: string) => {
    try {
      const newHistory = [
        searchQuery,
        ...searchHistory.filter((q) => q !== searchQuery),
      ].slice(0, 3); // Keep only last 3 unique searches

      setSearchHistory(newHistory);
      localStorage.setItem('search_history', JSON.stringify(newHistory));
    } catch (err) {
      console.error('Failed to save search history:', err);
    }
  };

  // Handle search submission
  const handleSearch = () => {
    setError(null);

    // Validate query length (reduced from 10 to 2 for short queries like "vegan", "DJ")
    if (query.length < 2) {
      setError('Query must be at least 2 characters');
      return;
    }

    if (query.length > 500) {
      setError('Query must be less than 500 characters');
      return;
    }

    // Add to history and trigger search
    addToHistory(query);
    onSearch(query);
  };

  // Handle Enter key
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !isLoading) {
      handleSearch();
    }
  };

  // Clear search
  const handleClear = () => {
    setQuery('');
    setError(null);
  };

  // Select from history
  const selectFromHistory = (historyQuery: string) => {
    setQuery(historyQuery);
    setShowHistory(false);
  };

  // Select example query
  const selectExample = (example: string) => {
    setQuery(example);
  };

  const charCount = query.length;
  const charCountColor =
    charCount < 2
      ? 'text-slate-400'
      : charCount > 500
      ? 'text-red-600'
      : 'text-green-600';

  return (
    <div className="w-full space-y-2">
      {/* Search Input */}
      <div className="relative">
        <div
          className={`flex items-center gap-2 rounded-lg border-2 bg-white p-3 shadow-sm transition-all ${
            error
              ? 'border-red-400'
              : showHistory
              ? 'border-blue-400'
              : 'border-slate-200 hover:border-slate-300 focus-within:border-blue-400'
          }`}
        >
          <Search className="h-5 w-5 flex-shrink-0 text-slate-400" />

          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => setShowHistory(searchHistory.length > 0)}
            onBlur={() => setTimeout(() => setShowHistory(false), 200)}
            placeholder={placeholder}
            disabled={isLoading}
            className="flex-1 bg-transparent text-sm outline-none placeholder:text-slate-400 disabled:cursor-not-allowed disabled:opacity-50"
          />

          {/* Character Counter */}
          <span className={`text-xs font-medium ${charCountColor}`}>
            {charCount}/500
          </span>

          {/* Clear Button */}
          {query && !isLoading && (
            <button
              onClick={handleClear}
              className="flex-shrink-0 rounded-full p-1 hover:bg-slate-100"
              type="button"
            >
              <X className="h-4 w-4 text-slate-500" />
            </button>
          )}

          {/* Search Button */}
          <button
            onClick={handleSearch}
            disabled={isLoading || charCount < 2 || charCount > 500}
            className="flex-shrink-0 rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            type="button"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              'Search'
            )}
          </button>
        </div>

        {/* Search History Dropdown */}
        {showHistory && searchHistory.length > 0 && (
          <div className="absolute left-0 right-0 top-full z-10 mt-1 rounded-lg border border-slate-200 bg-white shadow-lg">
            <div className="flex items-center gap-2 border-b border-slate-200 px-3 py-2">
              <History className="h-4 w-4 text-slate-400" />
              <span className="text-xs font-medium text-slate-600">
                Recent Searches
              </span>
            </div>
            <div className="max-h-48 overflow-y-auto">
              {searchHistory.map((historyQuery, index) => (
                <button
                  key={index}
                  onClick={() => selectFromHistory(historyQuery)}
                  className="w-full px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-50"
                  type="button"
                >
                  {historyQuery}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Example Queries */}
      {!query && !isLoading && (
        <div className="space-y-2">
          <p className="text-xs font-medium text-slate-600">
            Try these examples:
          </p>
          <div className="flex flex-wrap gap-2">
            {EXAMPLE_QUERIES.map((example, index) => (
              <button
                key={index}
                onClick={() => selectExample(example)}
                className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs text-slate-700 transition-colors hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700"
                type="button"
              >
                {example}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Character Count Hint */}
      {charCount > 0 && charCount < 2 && (
        <p className="text-xs text-slate-500">
          {2 - charCount} more character{2 - charCount !== 1 ? 's' : ''} needed
        </p>
      )}
    </div>
  );
}
