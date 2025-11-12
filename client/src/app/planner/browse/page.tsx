'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Card, CardContent } from '@/components/ui/Card';
import { PackageCard } from '@/components/planner/PackageCard';
import { CardSkeleton } from '@/components/ui/Skeleton';
import { ErrorState } from '@/components/shared/ErrorState';
import { Package, Event } from '@/types';
import { Search, Filter, X, Sparkles, Send, CheckSquare, Square } from 'lucide-react';

export default function BrowsePackagesPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const eventId = searchParams.get('eventId');

  const [packages, setPackages] = useState<Package[]>([]);
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [budgetFilter, setBudgetFilter] = useState('');
  const [capacityFilter, setCapacityFilter] = useState('');
  const [distanceFilter, setDistanceFilter] = useState('');
  const [servicesFilter, setServicesFilter] = useState('');
  const [selectedPackages, setSelectedPackages] = useState<Set<string>>(new Set());
  const [requestingQuotes, setRequestingQuotes] = useState(false);

  useEffect(() => {
    const fetchPackages = async () => {
      try {
        setLoading(true);
        setError(null);

        // If eventId is provided, fetch event details first
        if (eventId) {
          const eventResponse = await fetch(`/api/events/${eventId}`);
          const eventData = await eventResponse.json();
          if (eventResponse.ok && eventData.data) {
            setEvent(eventData.data);
          }
        }

        // Fetch packages (with optional event matching)
        // TIP: Add &includeAll=true to see ALL packages regardless of status (useful for development)
        // Example: const url = eventId ? `/api/packages?eventId=${eventId}&includeAll=true` : '/api/packages?includeAll=true';
        const url = eventId ? `/api/packages?eventId=${eventId}` : '/api/packages';
        const response = await fetch(url);
        const data = await response.json();

        if (!response.ok || data.error) {
          throw new Error(data.error?.message || 'Failed to fetch packages');
        }

        setPackages(data.data || []);
      } catch (err: any) {
        console.error('Error fetching packages:', err);
        setError(err.message || 'Failed to load packages');
      } finally {
        setLoading(false);
      }
    };

    fetchPackages();
  }, [eventId]);

  // Filter packages based on all criteria
  const filteredPackages = packages.filter(pkg => {
    // Search query filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const matchesSearch =
        pkg.name.toLowerCase().includes(query) ||
        pkg.description.toLowerCase().includes(query) ||
        (pkg.vendor?.business_name?.toLowerCase().includes(query) ?? false);
      if (!matchesSearch) return false;
    }

    // Budget filter
    if (budgetFilter) {
      if (budgetFilter === '0-2000') {
        if (pkg.price_min > 2000) return false;
      } else if (budgetFilter === '2000-4000') {
        if (pkg.price_max < 2000 || pkg.price_min > 4000) return false;
      } else if (budgetFilter === '4000-6000') {
        if (pkg.price_max < 4000 || pkg.price_min > 6000) return false;
      } else if (budgetFilter === '6000+') {
        if (pkg.price_max < 6000) return false;
      }
    }

    // Capacity filter
    if (capacityFilter) {
      if (capacityFilter === '0-50') {
        if (pkg.capacity > 50) return false;
      } else if (capacityFilter === '50-100') {
        if (pkg.capacity < 50 || pkg.capacity > 100) return false;
      } else if (capacityFilter === '100-200') {
        if (pkg.capacity < 100 || pkg.capacity > 200) return false;
      } else if (capacityFilter === '200+') {
        if (pkg.capacity < 200) return false;
      }
    }

    // Distance filter (only if distance is available from matching)
    if (distanceFilter && pkg.distance !== undefined) {
      const distance = pkg.distance;
      if (distanceFilter === '0-5') {
        if (distance > 5) return false;
      } else if (distanceFilter === '5-10') {
        if (distance < 5 || distance > 10) return false;
      } else if (distanceFilter === '10-20') {
        if (distance < 10 || distance > 20) return false;
      } else if (distanceFilter === '20+') {
        if (distance < 20) return false;
      }
    }

    // Services filter
    if (servicesFilter) {
      if (servicesFilter === 'venue') {
        if (!pkg.venue_details) return false;
      } else if (servicesFilter === 'venue-catering') {
        if (!pkg.venue_details || !pkg.catering_details) return false;
      } else if (servicesFilter === 'full') {
        if (!pkg.venue_details || !pkg.catering_details || !pkg.entertainment_details) return false;
      }
    }

    return true;
  });

  // Handle package selection toggle
  const togglePackageSelection = (packageId: string) => {
    setSelectedPackages(prev => {
      const newSet = new Set(prev);
      if (newSet.has(packageId)) {
        newSet.delete(packageId);
      } else {
        newSet.add(packageId);
      }
      return newSet;
    });
  };

  // Select all visible packages
  const selectAll = () => {
    setSelectedPackages(new Set(filteredPackages.map(pkg => pkg.id)));
  };

  // Clear all selections
  const clearAll = () => {
    setSelectedPackages(new Set());
  };

  // Request quotes for all selected packages
  const handleRequestQuotes = async () => {
    if (!eventId) {
      alert('Please create an event first to request quotes');
      router.push('/planner/events/create');
      return;
    }

    if (selectedPackages.size === 0) {
      alert('Please select at least one package');
      return;
    }

    setRequestingQuotes(true);

    try {
      const results = await Promise.allSettled(
        Array.from(selectedPackages).map(packageId =>
          fetch('/api/leads', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ eventId, packageId }),
          }).then(res => res.json())
        )
      );

      const successful = results.filter(r => r.status === 'fulfilled').length;
      const failed = results.filter(r => r.status === 'rejected').length;

      if (successful > 0) {
        alert(`Successfully requested ${successful} quote${successful > 1 ? 's' : ''}!${failed > 0 ? ` ${failed} failed.` : ''}`);
        setSelectedPackages(new Set());
        router.push('/planner/dashboard');
      } else {
        throw new Error('All quote requests failed');
      }
    } catch (err: any) {
      console.error('Error requesting quotes:', err);
      alert('Failed to request quotes. Please try again.');
    } finally {
      setRequestingQuotes(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="mb-8">
            <div className="h-8 w-64 bg-slate-200 rounded animate-pulse mb-2" />
            <div className="h-4 w-96 bg-slate-200 rounded animate-pulse" />
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <CardSkeleton key={i} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Card className="max-w-md">
          <ErrorState
            title="Failed to Load Packages"
            message={error}
            onRetry={() => window.location.reload()}
          />
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Browse Event Packages</h1>
          <p className="mt-2 text-slate-600">
            {eventId && event
              ? `Showing packages matched to your ${event.event_type} event`
              : 'Find complete event packages from verified vendors'}
          </p>
        </div>

        {/* Event Match Banner */}
        {eventId && event && (
          <Card className="mt-6 border-primary-200 bg-primary-50">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <Sparkles className="h-5 w-5 text-primary-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-primary-900">Smart Matching Enabled</p>
                  <p className="text-sm text-primary-700 mt-1">
                    Showing packages for {event.guest_count} guests with a budget of ${event.budget.toLocaleString()}
                    {packages.length > 0 && packages[0].distance !== undefined && (
                      <>, sorted by proximity and compatibility</>
                    )}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Search & Filters - keeping the mock data structure but using real packages */}
        <Card className="mt-8">
          <CardContent className="p-6">
            <div className="flex flex-col gap-4 lg:flex-row">
              {/* Search */}
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                  <Input
                    type="text"
                    placeholder="Search packages by name or vendor..."
                    className="pl-10"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>

              {/* Filter Toggle */}
              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
              >
                <Filter className="mr-2 h-4 w-4" />
                Filters
                {showFilters && <X className="ml-2 h-4 w-4" />}
              </Button>
            </div>

            {/* Expanded Filters */}
            {showFilters && (
              <div className="mt-6 grid gap-4 border-t border-slate-200 pt-6 sm:grid-cols-2 lg:grid-cols-4">
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">Budget</label>
                  <select
                    value={budgetFilter}
                    onChange={(e) => setBudgetFilter(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                  >
                    <option value="">Any budget</option>
                    <option value="0-2000">Under $2,000</option>
                    <option value="2000-4000">$2,000 - $4,000</option>
                    <option value="4000-6000">$4,000 - $6,000</option>
                    <option value="6000+">$6,000+</option>
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">Capacity</label>
                  <select
                    value={capacityFilter}
                    onChange={(e) => setCapacityFilter(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                  >
                    <option value="">Any size</option>
                    <option value="0-50">Up to 50</option>
                    <option value="50-100">50 - 100</option>
                    <option value="100-200">100 - 200</option>
                    <option value="200+">200+</option>
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">Distance</label>
                  <select
                    value={distanceFilter}
                    onChange={(e) => setDistanceFilter(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                    disabled={!eventId}
                  >
                    <option value="">Any distance</option>
                    <option value="0-5">Within 5 miles</option>
                    <option value="5-10">5 - 10 miles</option>
                    <option value="10-20">10 - 20 miles</option>
                    <option value="20+">20+ miles</option>
                  </select>
                  {!eventId && (
                    <p className="mt-1 text-xs text-slate-500">Available with event matching</p>
                  )}
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">Services</label>
                  <select
                    value={servicesFilter}
                    onChange={(e) => setServicesFilter(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                  >
                    <option value="">All services</option>
                    <option value="venue">Venue Only</option>
                    <option value="venue-catering">Venue + Catering</option>
                    <option value="full">Full Package</option>
                  </select>
                </div>

                {/* Clear Filters Button */}
                {(budgetFilter || capacityFilter || distanceFilter || servicesFilter) && (
                  <div className="sm:col-span-2 lg:col-span-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setBudgetFilter('');
                        setCapacityFilter('');
                        setDistanceFilter('');
                        setServicesFilter('');
                      }}
                    >
                      <X className="mr-2 h-4 w-4" />
                      Clear All Filters
                    </Button>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Results Count and Selection Controls */}
        <div className="mt-6 flex items-center justify-between">
          <p className="text-sm text-slate-600">
            Showing <span className="font-medium text-slate-900">{filteredPackages.length}</span> package{filteredPackages.length !== 1 ? 's' : ''}
            {selectedPackages.size > 0 && (
              <span className="ml-3 text-primary-600 font-medium">
                ({selectedPackages.size} selected)
              </span>
            )}
          </p>
          {eventId && filteredPackages.length > 0 && (
            <div className="flex gap-2">
              {selectedPackages.size > 0 ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={clearAll}
                >
                  <X className="mr-2 h-4 w-4" />
                  Clear All
                </Button>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={selectAll}
                >
                  <CheckSquare className="mr-2 h-4 w-4" />
                  Select All
                </Button>
              )}
            </div>
          )}
        </div>

        {/* Package Grid */}
        {filteredPackages.length > 0 ? (
          <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredPackages.map((pkg) => (
              <PackageCard
                key={pkg.id}
                package={pkg}
                eventId={eventId || undefined}
                selectable={!!eventId}
                selected={selectedPackages.has(pkg.id)}
                onToggleSelect={() => togglePackageSelection(pkg.id)}
              />
            ))}
          </div>
        ) : (
          <Card className="mt-6">
            <CardContent className="p-12 text-center">
              <Search className="mx-auto h-12 w-12 text-slate-400" />
              <h3 className="mt-4 text-lg font-semibold text-slate-900">No packages found</h3>
              <p className="mt-2 text-slate-600">
                {searchQuery
                  ? 'Try adjusting your search query'
                  : 'Try adjusting your filters or search criteria'}
              </p>
            </CardContent>
          </Card>
        )}

        {/* Floating Action Button for Batch Quote Request */}
        {eventId && selectedPackages.size > 0 && (
          <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50">
            <Button
              size="lg"
              onClick={handleRequestQuotes}
              disabled={requestingQuotes}
              className="shadow-lg hover:shadow-xl transition-all"
            >
              <Send className="mr-2 h-5 w-5" />
              {requestingQuotes ? (
                'Requesting Quotes...'
              ) : (
                `Request ${selectedPackages.size} Quote${selectedPackages.size > 1 ? 's' : ''}`
              )}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
