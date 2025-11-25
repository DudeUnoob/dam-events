'use client';

import { VenueInformationData } from '@/types';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { AmenitySearch } from '@/components/vendor/AmenitySearch';
import { AvailabilitySchedule } from '@/components/vendor/AvailabilitySchedule';
import { ExceptionDates } from '@/components/vendor/ExceptionDates';
import { PhotoUpload } from '@/components/vendor/PhotoUpload';

interface VenueInformationProps {
  data: VenueInformationData;
  onChange: (data: VenueInformationData) => void;
}

export function VenueInformation({ data, onChange }: VenueInformationProps) {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-12">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-slate-900">Venue Information</h1>
        <p className="mt-4 text-lg text-slate-600">
          Tell us about your venue and its features
        </p>
      </div>

      <div className="mt-12 space-y-8">
        {/* Capacity Section */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-xl font-semibold text-slate-900">
            Capacity & Space
          </h2>
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Minimum Capacity"
              type="number"
              min="1"
              value={data.min_capacity || ''}
              onChange={(e) =>
                onChange({ ...data, min_capacity: parseInt(e.target.value) || 0 })
              }
              placeholder="e.g., 20"
              required
            />
            <Input
              label="Maximum Capacity"
              type="number"
              min="1"
              value={data.max_capacity || ''}
              onChange={(e) =>
                onChange({ ...data, max_capacity: parseInt(e.target.value) || 0 })
              }
              placeholder="e.g., 200"
              required
            />
          </div>

          <div className="mt-4">
            <Input
              label="Square Footage (Optional)"
              type="number"
              min="0"
              value={data.square_footage || ''}
              onChange={(e) =>
                onChange({
                  ...data,
                  square_footage: parseInt(e.target.value) || undefined,
                })
              }
              placeholder="e.g., 5000"
            />
          </div>

          <div className="mt-4">
            <Textarea
              label="Short Description"
              value={data.short_description}
              onChange={(e) =>
                onChange({ ...data, short_description: e.target.value })
              }
              placeholder="Briefly describe your venue and what makes it special..."
              rows={4}
              maxLength={500}
              required
            />
            <p className="mt-1 text-xs text-slate-500">
              {data.short_description?.length || 0}/500 characters
            </p>
          </div>
        </div>

        {/* Hourly Rate Section */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-xl font-semibold text-slate-900">Hourly Rate $</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Input
                label="Minimum Hourly Rate"
                type="number"
                min="0"
                step="0.01"
                value={data.hourly_rate_min || ''}
                onChange={(e) =>
                  onChange({
                    ...data,
                    hourly_rate_min: parseFloat(e.target.value) || 0,
                  })
                }
                placeholder="100.00"
                required
              />
            </div>
            <div>
              <Input
                label="Maximum Hourly Rate"
                type="number"
                min="0"
                step="0.01"
                value={data.hourly_rate_max || ''}
                onChange={(e) =>
                  onChange({
                    ...data,
                    hourly_rate_max: parseFloat(e.target.value) || 0,
                  })
                }
                placeholder="500.00"
                required
              />
            </div>
          </div>
        </div>

        {/* Availability Section */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-xl font-semibold text-slate-900">Availability</h2>
          <AvailabilitySchedule
            availability={data.availability}
            onChange={(availability) => onChange({ ...data, availability })}
          />

          <div className="mt-6">
            <ExceptionDates
              exceptionDates={data.exception_dates}
              onChange={(exception_dates) => onChange({ ...data, exception_dates })}
            />
          </div>
        </div>

        {/* Amenities Section */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-xl font-semibold text-slate-900">Amenities</h2>
          <AmenitySearch
            selectedAmenities={data.amenities}
            onChange={(amenities) => onChange({ ...data, amenities })}
            placeholder="Search amenities (e.g., Wi-Fi, Parking)..."
          />
        </div>

        {/* Venue Photos Section */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-xl font-semibold text-slate-900">Venue Photos</h2>
          <PhotoUpload
            bucketName="package-photos"
            folderId="venue"
            onUpload={(urls) => onChange({ ...data, photos: urls })}
            existingPhotos={data.photos}
            maxPhotos={15}
          />
          <p className="mt-2 text-sm text-slate-500">
            Upload high-quality photos of your venue. The first photo will be used as
            the cover image.
          </p>
        </div>
      </div>
    </div>
  );
}
