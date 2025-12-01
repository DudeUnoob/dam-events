'use client';

import { useEffect, useState, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Package, Event } from '@/types';
import { DiscoverySearch } from '@/components/planner/discovery/DiscoverySearch';
import { CategoryNav } from '@/components/planner/discovery/CategoryNav';
import { FilterBar } from '@/components/planner/discovery/FilterBar';
import { HorizontalSection } from '@/components/planner/discovery/HorizontalSection';
import { DiscoveryCard } from '@/components/planner/discovery/DiscoveryCard';
import { SearchMetadata } from '@/components/planner/EnhancedSearchResults';

export default function BrowsePackagesPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const eventId = searchParams.get('eventId');

  // Data State
  const [packages, setPackages] = useState<Package[]>([]);
  const [featuredFoods, setFeaturedFoods] = useState<Package[]>([]);
  const [topVenues, setTopVenues] = useState<Package[]>([]);
  const [loading, setLoading] = useState(true);

  // Search & Filter State
  const [activeCategory, setActiveCategory] = useState('packages');
  const [filters, setFilters] = useState({
    price: '',
    availability: '',
    occasion: '',
    guest_count: '',
  });

  // Smart Search State
  const [searchMetadata, setSearchMetadata] = useState<SearchMetadata | null>(null);
  const [isSmartSearchActive, setIsSmartSearchActive] = useState(false);

  // Helper to build query string from filters
  const buildQueryString = useCallback((category: string, currentFilters: typeof filters) => {
    const params = new URLSearchParams();
    if (eventId) params.append('eventId', eventId);

    // DEVELOPMENT: Include all packages regardless of status
    params.append('includeAll', 'true');

    // Category mapping to service_type
    if (category === 'food') params.append('service_type', 'catering');
    if (category === 'venue') params.append('service_type', 'venue');
    if (category === 'entertainment') params.append('service_type', 'entertainment');
    if (category === 'rentals') params.append('service_type', 'rentals');

    // Price Filter
    if (currentFilters.price) {
      if (currentFilters.price === '6000+') {
        params.append('min_price', '6000');
      } else {
        const [min, max] = currentFilters.price.split('-');
        if (min) params.append('min_price', min);
        if (max) params.append('max_price', max);
      }
    }

    // Guest Count Filter
    if (currentFilters.guest_count) {
      if (currentFilters.guest_count === '200+') {
        params.append('min_capacity', '200');
      } else {
        const [min] = currentFilters.guest_count.split('-');
        if (min) params.append('min_capacity', min);
      }
    }

    return params.toString();
  }, [eventId]);

  // Fetch Data
  const fetchPackages = useCallback(async () => {
    try {
      setLoading(true);

      // 1. Fetch Main List (Recommended/Filtered)
      const queryStr = buildQueryString(activeCategory, filters);
      const packagesRes = await fetch(`/api/packages?${queryStr}`);
      const packagesData = await packagesRes.json();

      if (packagesRes.ok && packagesData.data) {
        setPackages(packagesData.data);
      }

      // 2. Fetch Specific Sections (Only on initial load or if not searching)
      if (!isSmartSearchActive) {
        // Featured Foods
        const foodsRes = await fetch('/api/packages?service_type=catering&limit=5&includeAll=true');
        const foodsData = await foodsRes.json();
        if (foodsRes.ok && foodsData.data) setFeaturedFoods(foodsData.data);

        // Top Venues
        const venuesRes = await fetch('/api/packages?service_type=venue&limit=5&includeAll=true');
        const venuesData = await venuesRes.json();
        if (venuesRes.ok && venuesData.data) setTopVenues(venuesData.data);
      }

    } catch (err) {
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  }, [activeCategory, filters, isSmartSearchActive, buildQueryString]);

  // Initial Load & Filter Changes
  useEffect(() => {
    if (!isSmartSearchActive) {
      fetchPackages();
    }
  }, [fetchPackages, isSmartSearchActive]);

  // Handle Smart Search
  const handleSearch = async (query: string, location: string, eventType: string) => {
    if (!query && !location) {
      // Reset if empty
      setIsSmartSearchActive(false);
      return;
    }

    try {
      setLoading(true);
      setIsSmartSearchActive(true);

      // Construct natural language query if multiple fields used
      let fullQuery = query;
      if (location) fullQuery += ` in ${location}`;
      if (eventType && eventType !== 'Event') fullQuery += ` for ${eventType}`;

      const response = await fetch('/api/search/smart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: fullQuery }),
      });

      const data = await response.json();

      if (response.ok && data.data) {
        setPackages(data.data.results || []);
        setSearchMetadata({
          correctedQuery: data.data.correctedQuery,
          expandedQuery: data.data.expandedQuery,
          didYouMean: data.data.didYouMean,
          relatedSearches: data.data.relatedSearches,
          searchQuality: data.data.searchQuality,
          totalMatches: data.data.totalMatches,
        });

        // Auto-populate filters from extracted params
        if (data.data.extractedParams) {
          const params = data.data.extractedParams;
          setFilters(prev => ({
            ...prev,
            price: params.budget_max ? `0-${params.budget_max}` : prev.price, // Simplified mapping
            guest_count: params.capacity_min ? `${params.capacity_min}-200` : prev.guest_count, // Simplified mapping
          }));
        }
      }
    } catch (err) {
      console.error('Smart search error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Handle Filter Change
  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    // useEffect will trigger fetchPackages
  };

  const handleClearFilters = () => {
    setFilters({
      price: '',
      availability: '',
      occasion: '',
      guest_count: '',
    });
    if (isSmartSearchActive) {
      // Keep smart search active but clear filters? 
      // Or maybe reset smart search? Let's keep it simple.
    } else {
      // useEffect will trigger fetchPackages
    }
  };

  // Handle Category Selection
  const handleCategorySelect = (category: string) => {
    setActiveCategory(category);
    // useEffect will trigger fetchPackages
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header Section */}
      <div className="sticky top-0 z-20 bg-white/80 backdrop-blur-md border-b border-slate-100 pt-4 pb-2">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <DiscoverySearch onSearch={handleSearch} />
          <CategoryNav
            activeCategory={activeCategory}
            onSelectCategory={handleCategorySelect}
          />
        </div>
      </div>

      {/* Filter Bar */}
      <div className="border-b border-slate-100">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <FilterBar
            filters={filters}
            onFilterChange={handleFilterChange}
            onClearFilters={handleClearFilters}
          />
        </div>
      </div>

      {/* Main Content */}
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">

        {/* Search Metadata / Suggestions */}
        {isSmartSearchActive && searchMetadata?.correctedQuery && (
          <div className="bg-blue-50 p-3 rounded-lg text-sm text-blue-800">
            Showing results for <strong>{searchMetadata.correctedQuery}</strong>
          </div>
        )}

        {/* Recommended Packages Section */}
        <HorizontalSection title={isSmartSearchActive ? "Search Results" : "Recommended Packages"}>
          {loading ? (
            // Skeleton loading state
            [...Array(4)].map((_, i) => (
              <div key={i} className="w-[300px] h-72 bg-slate-100 rounded-xl animate-pulse flex-shrink-0" />
            ))
          ) : packages.length > 0 ? (
            packages.map((pkg) => (
              <DiscoveryCard
                key={pkg.id}
                packageData={pkg}
              />
            ))
          ) : (
            <div className="w-full text-center py-12 text-slate-500">
              No packages found. Try adjusting your search.
            </div>
          )}
        </HorizontalSection>

        {/* Featured Foods Section */}
        {!isSmartSearchActive && featuredFoods.length > 0 && (
          <HorizontalSection title="Featured Foods">
            {featuredFoods.map((pkg) => (
              <DiscoveryCard
                key={`food-${pkg.id}`}
                packageData={pkg}
              />
            ))}
          </HorizontalSection>
        )}

        {/* Venues Section */}
        {!isSmartSearchActive && topVenues.length > 0 && (
          <HorizontalSection title="Top Venues">
            {topVenues.map((pkg) => (
              <DiscoveryCard
                key={`venue-${pkg.id}`}
                packageData={pkg}
              />
            ))}
          </HorizontalSection>
        )}

      </div>
    </div>
  );
}
