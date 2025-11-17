'use client';

import { useState } from 'react';
import { Search, Sparkles } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

interface SemanticSearchProps {
  onSearch: (query: string, filters?: any) => void;
  placeholder?: string;
  showFilters?: boolean;
  isLoading?: boolean;
}

export function SemanticSearch({ 
  onSearch, 
  placeholder = "Search with natural language...",
  showFilters = false,
  isLoading = false
}: SemanticSearchProps) {
  const [query, setQuery] = useState('');
  
  // Filter states
  const [maxPrice, setMaxPrice] = useState<string>('');
  const [minCapacity, setMinCapacity] = useState<string>('');
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    
    const filters = showFilters ? {
      maxPrice: maxPrice ? Number(maxPrice) : undefined,
      minCapacity: minCapacity ? Number(minCapacity) : undefined,
      serviceTypes: selectedServices.length > 0 ? selectedServices : undefined,
    } : undefined;
    
    await onSearch(query, filters);
  };
  
  const exampleQueries = [
    "Wedding venue for 200 guests under $50,000",
    "Outdoor catering with vegetarian options",
    "Entertainment for corporate events",
    "Full service package with venue and catering",
  ];
  
  const serviceOptions = ['venue', 'catering', 'entertainment'];
  
  const toggleService = (service: string) => {
    setSelectedServices(prev => 
      prev.includes(service) 
        ? prev.filter(s => s !== service)
        : [...prev, service]
    );
  };
  
  return (
    <div className="w-full max-w-4xl mx-auto space-y-4">
      <form onSubmit={handleSearch} className="flex gap-2">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
          <Input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={placeholder}
            className="pl-10 pr-4 py-3 text-lg"
            disabled={isLoading}
          />
        </div>
        <Button 
          type="submit" 
          disabled={isLoading || !query.trim()}
          className="px-6 flex items-center gap-2"
        >
          {isLoading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
              Searching...
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4" />
              Search
            </>
          )}
        </Button>
      </form>
      
      {showFilters && (
        <div className="bg-gray-50 p-4 rounded-lg space-y-3">
          <h3 className="text-sm font-semibold text-gray-700">Filters (Optional)</h3>
          <div className="flex gap-4 flex-wrap items-center">
            <div className="flex-1 min-w-[200px]">
              <label className="block text-xs text-gray-600 mb-1">Max Budget</label>
              <Input
                type="number"
                placeholder="e.g., 50000"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                className="w-full"
                disabled={isLoading}
              />
            </div>
            <div className="flex-1 min-w-[200px]">
              <label className="block text-xs text-gray-600 mb-1">Min Capacity</label>
              <Input
                type="number"
                placeholder="e.g., 100"
                value={minCapacity}
                onChange={(e) => setMinCapacity(e.target.value)}
                className="w-full"
                disabled={isLoading}
              />
            </div>
          </div>
          
          <div>
            <label className="block text-xs text-gray-600 mb-2">Service Types</label>
            <div className="flex gap-2 flex-wrap">
              {serviceOptions.map((service) => (
                <button
                  key={service}
                  type="button"
                  onClick={() => toggleService(service)}
                  disabled={isLoading}
                  className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                    selectedServices.includes(service)
                      ? 'bg-blue-600 text-white'
                      : 'bg-white text-gray-700 border border-gray-300 hover:border-blue-600'
                  }`}
                >
                  {service.charAt(0).toUpperCase() + service.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
      
      <div className="flex flex-wrap gap-2 items-center">
        <span className="text-sm text-gray-600">💡 Try:</span>
        {exampleQueries.map((example, i) => (
          <button
            key={i}
            type="button"
            onClick={() => setQuery(example)}
            disabled={isLoading}
            className="text-sm text-blue-600 hover:underline disabled:opacity-50"
          >
            "{example}"
          </button>
        ))}
      </div>
    </div>
  );
}

