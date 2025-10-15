'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Card, CardContent } from '@/components/ui/Card';
import { PackageCard } from '@/components/planner/PackageCard';
import { CardSkeleton } from '@/components/ui/Skeleton';
import { ErrorState } from '@/components/shared/ErrorState';
import { Package, Event } from '@/types';
import { Search, Filter, X, Sparkles } from 'lucide-react';

export default function BrowsePackagesPage() {
  const searchParams = useSearchParams();
  const eventId = searchParams.get('eventId');

  const [packages, setPackages] = useState<Package[]>([]);
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

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

  // Filter packages based on search query
  const filteredPackages = packages.filter(pkg => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      pkg.name.toLowerCase().includes(query) ||
      pkg.description.toLowerCase().includes(query) ||
      pkg.vendor?.business_name.toLowerCase().includes(query)
    );
  });

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
                <Select label="Budget">
                  <option value="">Any budget</option>
                  <option value="0-2000">Under $2,000</option>
                  <option value="2000-4000">$2,000 - $4,000</option>
                  <option value="4000-6000">$4,000 - $6,000</option>
                  <option value="6000+">$6,000+</option>
                </Select>

                <Select label="Capacity">
                  <option value="">Any size</option>
                  <option value="0-50">Up to 50</option>
                  <option value="50-100">50 - 100</option>
                  <option value="100-200">100 - 200</option>
                  <option value="200+">200+</option>
                </Select>

                <Select label="Distance">
                  <option value="">Any distance</option>
                  <option value="0-5">Within 5 miles</option>
                  <option value="5-10">5 - 10 miles</option>
                  <option value="10-20">10 - 20 miles</option>
                  <option value="20+">20+ miles</option>
                </Select>

                <Select label="Services">
                  <option value="">All services</option>
                  <option value="venue">Venue Only</option>
                  <option value="venue-catering">Venue + Catering</option>
                  <option value="full">Full Package</option>
                </Select>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Results Count */}
        <div className="mt-6 flex items-center justify-between">
          <p className="text-sm text-slate-600">
            Showing <span className="font-medium text-slate-900">{filteredPackages.length}</span> package{filteredPackages.length !== 1 ? 's' : ''}
          </p>
        </div>

        {/* Package Grid */}
        {filteredPackages.length > 0 ? (
          <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredPackages.map((pkg) => (
              <PackageCard
                key={pkg.id}
                package={pkg}
                eventId={eventId || undefined}
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
      </div>
    </div>
  );
}
