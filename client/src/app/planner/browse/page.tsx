'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Card, CardContent } from '@/components/ui/Card';
import { PackageCard } from '@/components/planner/PackageCard';
import { Package } from '@/types';
import { Search, Filter, X } from 'lucide-react';

// Mock data - will be replaced with actual data from Supabase
const mockPackages: Package[] = [
  {
    id: '1',
    vendor_id: 'vendor-1',
    name: 'Premium Social Package',
    description: 'Perfect for large social gatherings with full catering and entertainment',
    venue_details: {
      name: 'Grand Ballroom',
      capacity: 200,
      amenities: ['Stage', 'Dance Floor', 'Audio System'],
    },
    catering_details: {
      menu_options: ['Buffet', 'Plated Dinner'],
      dietary_accommodations: ['Vegetarian', 'Vegan', 'Gluten-Free'],
    },
    entertainment_details: {
      type: 'DJ',
      equipment: ['Sound System', 'Lighting'],
    },
    price_min: 4000,
    price_max: 6000,
    capacity: 200,
    photos: [],
    status: 'published',
    created_at: '2025-01-01T00:00:00Z',
    updated_at: '2025-01-01T00:00:00Z',
    vendor: {
      id: 'vendor-1',
      user_id: 'user-1',
      business_name: 'Elite Events Venue',
      description: 'Premium event space',
      services: ['venue', 'catering', 'entertainment'],
      location_address: '123 Main St, Austin, TX',
      location_lat: 30.2672,
      location_lng: -97.7431,
      status: 'verified',
      created_at: '2025-01-01T00:00:00Z',
      updated_at: '2025-01-01T00:00:00Z',
    },
    distance: 2.3,
  },
  {
    id: '2',
    vendor_id: 'vendor-2',
    name: 'Intimate Gathering Package',
    description: 'Cozy space perfect for smaller events with personalized service',
    venue_details: {
      name: 'Garden Terrace',
      capacity: 80,
      amenities: ['Outdoor Space', 'Indoor Backup'],
    },
    catering_details: {
      menu_options: ['Appetizers', 'Small Plates'],
      dietary_accommodations: ['Vegetarian', 'Vegan'],
    },
    price_min: 2000,
    price_max: 3500,
    capacity: 80,
    photos: [],
    status: 'published',
    created_at: '2025-01-01T00:00:00Z',
    updated_at: '2025-01-01T00:00:00Z',
    vendor: {
      id: 'vendor-2',
      user_id: 'user-2',
      business_name: 'Garden Events Co',
      description: 'Beautiful outdoor venue',
      services: ['venue', 'catering'],
      location_address: '456 Oak Ave, Austin, TX',
      location_lat: 30.2849,
      location_lng: -97.7341,
      status: 'verified',
      created_at: '2025-01-01T00:00:00Z',
      updated_at: '2025-01-01T00:00:00Z',
    },
    distance: 4.1,
  },
];

export default function BrowsePackagesPage() {
  const [showFilters, setShowFilters] = useState(false);
  const [selectedPackages, setSelectedPackages] = useState<string[]>([]);

  const handleRequestQuote = (packageId: string) => {
    // TODO: Implement quote request
    console.log('Request quote for:', packageId);
  };

  const handleBulkRequestQuotes = () => {
    // TODO: Implement bulk quote request
    console.log('Request quotes for:', selectedPackages);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Browse Event Packages</h1>
          <p className="mt-2 text-slate-600">
            Find complete event packages from verified vendors
          </p>
        </div>

        {/* Search & Filters */}
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

        {/* Results Count & Bulk Actions */}
        <div className="mt-6 flex items-center justify-between">
          <p className="text-sm text-slate-600">
            Showing <span className="font-medium text-slate-900">{mockPackages.length}</span> packages
          </p>
          {selectedPackages.length > 0 && (
            <Button onClick={handleBulkRequestQuotes}>
              Request Quotes ({selectedPackages.length})
            </Button>
          )}
        </div>

        {/* Package Grid */}
        {mockPackages.length > 0 ? (
          <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {mockPackages.map((pkg) => (
              <PackageCard
                key={pkg.id}
                package={pkg}
                onRequestQuote={handleRequestQuote}
              />
            ))}
          </div>
        ) : (
          <Card className="mt-6">
            <CardContent className="p-12 text-center">
              <Search className="mx-auto h-12 w-12 text-slate-400" />
              <h3 className="mt-4 text-lg font-semibold text-slate-900">No packages found</h3>
              <p className="mt-2 text-slate-600">
                Try adjusting your filters or search criteria
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
