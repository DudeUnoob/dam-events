'use client';

import { useEffect, useState, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Package } from '@/types';
import { DiscoverySearch } from '@/components/planner/discovery/DiscoverySearch';
import { CategoryNav } from '@/components/planner/discovery/CategoryNav';
import { FilterBar } from '@/components/planner/discovery/FilterBar';
import { HorizontalSection } from '@/components/planner/discovery/HorizontalSection';
import { DiscoveryCard } from '@/components/planner/discovery/DiscoveryCard';
import { SearchMetadata } from '@/components/planner/EnhancedSearchResults';

export default function HomePage() {
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
            price: params.budget_max ? `0-${params.budget_max}` : prev.price,
            guest_count: params.capacity_min ? `${params.capacity_min}-200` : prev.guest_count,
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
  };

  const handleClearFilters = () => {
    setFilters({
      price: '',
      availability: '',
      occasion: '',
      guest_count: '',
    });
  };

  // Handle Category Selection
  const handleCategorySelect = (category: string) => {
    setActiveCategory(category);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Search Bar Section */}
      <div className="pt-10 pb-2">
        <DiscoverySearch onSearch={handleSearch} />
      </div>

      {/* Category Navigation with decorative background */}
      <div className="relative">
        {/* Decorative gradient blur circles - matching Figma */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {/* Purple circle top-right */}
          <div className="absolute w-[214px] h-[214px] rounded-full bg-purple-200/30 blur-xl top-[-20px] right-[300px]" />
          {/* Blue circle */}
          <div className="absolute w-[202px] h-[202px] rounded-full bg-blue-200/30 blur-xl top-[-30px] right-[200px]" />
          {/* Yellow circle */}
          <div className="absolute w-[200px] h-[200px] rounded-full bg-yellow-200/30 blur-xl top-[20px] left-[300px]" />
          {/* Pink circle */}
          <div className="absolute w-[214px] h-[214px] rounded-full bg-pink-200/30 blur-xl top-[-30px] left-[380px]" />
          {/* Green circle */}
          <div className="absolute w-[199px] h-[199px] rounded-full bg-green-200/30 blur-xl top-[0px] left-[280px]" />
          {/* Central radial gradient */}
          <div
            className="absolute w-[1169px] h-[276px] left-1/2 -translate-x-1/2 top-[40px] rounded-[150px] blur-sm"
            style={{
              background: 'radial-gradient(50% 50% at 50% 50%, rgba(221,233,243,0.5) 0%, rgba(226,231,247,0.3) 58%, rgba(221,233,243,0.1) 93%, rgba(221,233,243,0.05) 100%)'
            }}
          />
        </div>

        <div className="relative z-10">
          <CategoryNav
            activeCategory={activeCategory}
            onSelectCategory={handleCategorySelect}
          />
        </div>
      </div>

      {/* Filter Bar */}
      <FilterBar
        filters={filters}
        onFilterChange={handleFilterChange}
        onClearFilters={handleClearFilters}
      />

      {/* Main Content */}
      <div className="pt-4 pb-8 space-y-4">

        {/* Search Metadata / Suggestions */}
        {isSmartSearchActive && searchMetadata?.correctedQuery && (
          <div className="mx-[93px] bg-blue-50 p-3 rounded-lg text-sm text-blue-800">
            Showing results for <strong>{searchMetadata.correctedQuery}</strong>
          </div>
        )}

        {/* Recommended Packages Section */}
        <HorizontalSection title={isSmartSearchActive ? "Search Results" : "Recommended Packages"}>
          {loading ? (
            // Skeleton loading state
            [...Array(4)].map((_, i) => (
              <DiscoveryCard key={i} />
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
