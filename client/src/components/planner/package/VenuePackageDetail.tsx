'use client';

import React from 'react';
import { Package } from '@/types';
import { Button } from '@/components/ui/Button';
import {
  Star,
  MapPin,
  Check,
  Users,
  Ruler,
  ArrowUp,
  Plus,
} from 'lucide-react';

interface VenuePackageDetailProps {
  pkg: Package;
}

// Simple amenity list for the venue frame
const DEFAULT_AMENITIES = [
  'Catering Kitchen',
  'Dance Floor',
  'Bridal Suite',
  'WiFi',
  'Stage',
  'Audio/Visual Equipment',
  'Bar Area',
  'Valet Parking',
  'Outdoor Patio',
];

export default function VenuePackageDetail({ pkg }: VenuePackageDetailProps) {
  const photos = pkg.photos || [];

  return (
    <div className="min-h-screen bg-white">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Hero image */}
        <div className="relative h-[260px] w-full rounded-t-[25px] overflow-hidden shadow-lg">
          <img
            src={photos[0] || '/placeholder-venue.jpg'}
            alt={pkg.name}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Thumbnail strip */}
        {photos.length > 1 && (
          <div className="mt-4 flex gap-4 overflow-x-auto pb-2">
            {photos.slice(1, 5).map((photo, idx) => (
              <div
                key={photo + idx}
                className="w-[170px] h-[110px] rounded-[15px] overflow-hidden flex-shrink-0"
              >
                <img
                  src={photo}
                  alt={`${pkg.name} photo ${idx + 2}`}
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
          </div>
        )}

        <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,2.3fr)_minmax(0,1.1fr)]">
          {/* Left column */}
          <div className="space-y-6">
            {/* Vendor header card */}
            <div className="bg-[#f4f6fa] rounded-[25px] shadow-[0px_1px_8px_rgba(0,0,0,0.15)] px-8 py-5 border border-[#e1e5f0]">
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-2">
                  <h1 className="text-[28px] font-medium text-[#f9402b]">
                    {pkg.vendor?.business_name || 'Vendor Name'}
                  </h1>
                  <div className="flex items-center gap-4 text-sm text-black">
                    <div className="flex items-center gap-1">
                      <span className="font-normal text-base">4.2</span>
                      <div className="flex">
                        {[1, 2, 3, 4].map((i) => (
                          <Star
                            key={i}
                            className="w-4 h-4 fill-[#545f71] text-[#545f71]"
                          />
                        ))}
                        <Star className="w-4 h-4 text-[#9ba5b7]" />
                      </div>
                      <span className="text-sm">(45)</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <MapPin className="w-4 h-4 text-[#545f71]" />
                      <span>
                        {pkg.vendor?.location_address || '123 Congress Ave, Austin, TX 78701'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <button className="flex items-center gap-2 bg-white rounded-full px-4 py-2 text-sm border border-[#d8dfe9]">
                    <span>Save</span>
                  </button>
                  <button className="flex items-center gap-2 bg-white rounded-full px-4 py-2 text-sm border border-[#d8dfe9]">
                    <span>Share</span>
                  </button>
                </div>
              </div>
            </div>

            {/* About / Details / Amenities */}
            <div className="bg-white border border-[#9ba5b7] rounded-[25px] p-6 shadow-sm space-y-6">
              {/* About */}
              <div>
                <h2 className="text-xl font-semibold mb-2">About This Venue</h2>
                <p className="text-sm leading-relaxed text-[#364153]">
                  {pkg.description ||
                    'An elegant and spacious venue perfect for weddings, corporate events, galas and celebrations of all kinds. High ceilings, beautiful lighting and flexible layout options make this a versatile space for any occasion.'}
                </p>
              </div>

              <div className="border-t border-gray-200" />

              {/* Details */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div className="bg-[#f4f6fa] rounded-xl p-4 flex items-start gap-3">
                    <Users className="w-5 h-5 text-[#545f71] mt-1" />
                    <div>
                      <p className="text-xs text-[#6a7282]">Capacity</p>
                      <p className="text-sm text-black">
                        Up to {pkg.venue_details?.max_capacity || pkg.capacity || 300} guests
                      </p>
                    </div>
                  </div>
                  <div className="bg-[#f4f6fa] rounded-xl p-4 flex items-start gap-3">
                    <Ruler className="w-5 h-5 text-[#545f71] mt-1" />
                    <div>
                      <p className="text-xs text-[#6a7282]">Square Feet</p>
                      <p className="text-sm text-black">
                        {pkg.venue_details?.square_footage
                          ? `${pkg.venue_details.square_footage.toLocaleString()} sq ft`
                          : '5,000 sq ft'}
                      </p>
                    </div>
                  </div>
                  <div className="bg-[#f4f6fa] rounded-xl p-4 flex items-start gap-3">
                    <ArrowUp className="w-5 h-5 text-[#545f71] mt-1" />
                    <div>
                      <p className="text-xs text-[#6a7282]">Ceiling Height</p>
                      <p className="text-sm text-black">18 ft</p>
                    </div>
                  </div>
                </div>

                {/* Days of Operation */}
                <div className="mb-2">
                  <p className="text-xs font-medium text-[#6a7282] mb-2">
                    Days of Operation
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {['Monday', 'Tuesday', 'Wednesday', 'Thursday'].map((day) => (
                      <span
                        key={day}
                        className="px-3 py-1.5 rounded-full bg-[#f2f4f8] text-xs text-[#364153]"
                      >
                        {day}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Amenities */}
              <div className="border-t border-gray-200 pt-4">
                <h3 className="text-lg font-semibold mb-3">Amenities</h3>
                <div className="grid grid-cols-2 gap-y-2">
                  {(pkg.venue_details?.amenities?.length
                    ? pkg.venue_details.amenities
                    : DEFAULT_AMENITIES
                  ).map((amenity) => (
                    <div key={amenity} className="flex items-center gap-2 text-sm">
                      <Check className="w-4 h-4 text-green-500" />
                      <span>{amenity}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Reviews (reusing layout from catering detail) */}
            <div className="mt-2 pt-4 border-t border-gray-200">
              <h3 className="text-xl font-semibold mb-2">Reviews</h3>
              <div className="flex items-center gap-2 mb-4">
                <span className="text-xl font-medium">4.2</span>
                <div className="flex">
                  {[1, 2, 3, 4].map((i) => (
                    <Star
                      key={i}
                      className="w-4 h-4 fill-[#545f71] text-[#545f71]"
                    />
                  ))}
                  <Star className="w-4 h-4 text-[#9ba5b7]" />
                </div>
                <span className="text-sm text-[#545f71]">(45)</span>
              </div>
            </div>
          </div>

          {/* Right column - Pricing + map */}
          <div className="space-y-6 w-full max-w-sm ml-auto">
            {/* Pricing card */}
            <div className="bg-white border border-[#9ba5b7] rounded-[25px] p-6 shadow-sm">
              <h3 className="text-xl font-semibold mb-3">Pricing</h3>
              <p className="text-sm text-[#4a5565]">Ranging from</p>
              <p className="text-[26px] text-black">
                ${pkg.price_min?.toLocaleString() || '5,000'} - $
                {pkg.price_max?.toLocaleString() || '7,500'}
              </p>
              <p className="text-sm text-[#6a7282] mb-4">per event</p>

              <Button
                variant="ghost"
                size="sm"
                className="w-full h-9 bg-[#232834] hover:bg-[#111827] text-white rounded-[15px] text-xs font-medium tracking-[-0.15px] leading-5 border border-transparent flex items-center justify-center gap-2 whitespace-nowrap"
              >
                <Plus className="w-5 h-5" />
                <span>Request Quote</span>
              </Button>
              <p className="text-xs text-center text-[#6a7282] mt-3">
                You&apos;ll be able to select or create an event
              </p>
            </div>

            {/* Map card */}
            <div className="border border-[#9ba5b7]/40 rounded-[25px] overflow-hidden shadow-sm">
              <div className="h-[260px] bg-gray-100 flex items-center justify-center">
                <MapPin className="w-10 h-10 text-[#545f71]" />
              </div>
              <div className="bg-[#232834] text-white px-4 py-4 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-[#f2f4f8]" />
                <span className="text-sm">
                  {pkg.vendor?.location_address || 'Location'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

