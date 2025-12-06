'use client';

import { OnboardingStep5VenueData, COMMON_AMENITIES, WeeklyAvailability } from '@/types';
import { AvailabilitySchedule } from '@/components/vendor/AvailabilitySchedule';
import { Search } from 'lucide-react';
import { useState } from 'react';

interface Step5VenueProps {
  data: OnboardingStep5VenueData;
  onChange: (data: Partial<OnboardingStep5VenueData>) => void;
}

// Figma-styled input component
function FigmaInput({
  label,
  placeholder,
  value,
  onChange,
  type = 'text',
}: {
  label: string;
  placeholder: string;
  value: string | number;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  type?: string;
}) {
  return (
    <div>
      <label
        className="block text-[15px] font-medium text-black/70 mb-2"
        style={{ fontFamily: "'Urbanist', sans-serif" }}
      >
        {label}
      </label>
      <input
        type={type}
        placeholder={placeholder}
        value={value || ''}
        onChange={onChange}
        className="
          w-full h-[50px] px-4
          bg-white border border-black/20 rounded-[10px]
          text-[16px] text-black/80 placeholder:text-black/40
          focus:outline-none focus:ring-2 focus:ring-[#65a4d8]/50
        "
        style={{ fontFamily: "'Manrope', sans-serif" }}
      />
    </div>
  );
}

// Figma-styled textarea
function FigmaTextarea({
  label,
  placeholder,
  value,
  onChange,
  rows = 4,
}: {
  label: string;
  placeholder: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  rows?: number;
}) {
  return (
    <div>
      <label
        className="block text-[15px] font-medium text-black/70 mb-2"
        style={{ fontFamily: "'Urbanist', sans-serif" }}
      >
        {label}
      </label>
      <textarea
        placeholder={placeholder}
        value={value || ''}
        onChange={onChange}
        rows={rows}
        className="
          w-full px-4 py-3
          bg-white border border-black/20 rounded-[10px]
          text-[16px] text-black/80 placeholder:text-black/40
          focus:outline-none focus:ring-2 focus:ring-[#65a4d8]/50
          resize-none
        "
        style={{ fontFamily: "'Manrope', sans-serif" }}
      />
    </div>
  );
}

export function Step5Venue({ data, onChange }: Step5VenueProps) {
  const [amenitySearch, setAmenitySearch] = useState('');

  const toggleAmenity = (amenity: string) => {
    const current = data.amenities || [];
    const isSelected = current.includes(amenity);

    if (isSelected) {
      onChange({ amenities: current.filter((a) => a !== amenity) });
    } else {
      onChange({ amenities: [...current, amenity] });
    }
  };

  const filteredAmenities = COMMON_AMENITIES.filter((amenity) =>
    amenity.toLowerCase().includes(amenitySearch.toLowerCase())
  );

  return (
    <div className="relative min-h-[700px]">
      {/* Decorative gradient blurs */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[1200px] h-[300px] rounded-[150px] blur-sm opacity-30 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at center, rgba(221,233,243,0.5) 0%, rgba(221,233,243,0.3) 50%, rgba(221,233,243,0.05) 100%)',
        }}
      />
      <div
        className="absolute top-[200px] left-1/2 -translate-x-1/2 w-[1100px] h-[600px] rounded-[50px] blur-sm opacity-20 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at 20% 30%, rgba(210,211,239,0.35) 0%, rgba(210,211,239,0.2) 50%, rgba(210,211,239,0.3) 100%)',
        }}
      />

      <div className="relative z-10 space-y-6 pt-4">
        {/* Title */}
        <div className="text-center mb-8">
          <h1
            className="text-3xl md:text-4xl lg:text-[45px] font-semibold text-black"
            style={{ fontFamily: "'Poppins', sans-serif" }}
          >
            Venue Information
          </h1>
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto px-4">
          {/* Left Column */}
          <div className="space-y-5">
            {/* Capacity */}
            <div>
              <label
                className="block text-[18px] font-medium text-black mb-3"
                style={{ fontFamily: "'Urbanist', sans-serif" }}
              >
                Capacity
              </label>
              <div className="grid grid-cols-2 gap-4">
                <FigmaInput
                  label="Minimum"
                  placeholder="50"
                  type="number"
                  value={data.minCapacity || ''}
                  onChange={(e) => onChange({ minCapacity: parseInt(e.target.value) || 0 })}
                />
                <FigmaInput
                  label="Maximum"
                  placeholder="500"
                  type="number"
                  value={data.maxCapacity || ''}
                  onChange={(e) => onChange({ maxCapacity: parseInt(e.target.value) || 0 })}
                />
              </div>
            </div>

            {/* Square Footage */}
            <FigmaInput
              label="Square Footage"
              placeholder="5000"
              type="number"
              value={data.squareFootage || ''}
              onChange={(e) => onChange({ squareFootage: parseInt(e.target.value) || 0 })}
            />

            {/* Short Description */}
            <FigmaTextarea
              label="Short Description"
              placeholder="Describe your venue..."
              value={data.shortDescription}
              onChange={(e) => onChange({ shortDescription: e.target.value })}
              rows={3}
            />

            {/* Hourly Rate */}
            <div>
              <label
                className="block text-[18px] font-medium text-black mb-3"
                style={{ fontFamily: "'Urbanist', sans-serif" }}
              >
                Hourly Rate $
              </label>
              <div className="grid grid-cols-2 gap-4">
                <FigmaInput
                  label="Minimum"
                  placeholder="100"
                  type="number"
                  value={data.hourlyRateMin || ''}
                  onChange={(e) => onChange({ hourlyRateMin: parseFloat(e.target.value) || 0 })}
                />
                <FigmaInput
                  label="Maximum"
                  placeholder="500"
                  type="number"
                  value={data.hourlyRateMax || ''}
                  onChange={(e) => onChange({ hourlyRateMax: parseFloat(e.target.value) || 0 })}
                />
              </div>
            </div>

            {/* Photo Upload */}
            <div>
              <label
                className="block text-[18px] font-medium text-black mb-3"
                style={{ fontFamily: "'Urbanist', sans-serif" }}
              >
                Venue Photos
              </label>
              <div
                className="rounded-[15px] p-8 text-center"
                style={{
                  border: '3px dashed rgba(0,0,0,0.2)',
                  background: 'linear-gradient(135deg, rgba(200,222,236,0.1) 0%, rgba(210,211,239,0.1) 100%)',
                }}
              >
                <p
                  className="text-[16px] text-black/50"
                  style={{ fontFamily: "'Manrope', sans-serif" }}
                >
                  Upload Photos [PNG or JPEG]
                </p>
                <p
                  className="text-[12px] text-black/30 mt-1"
                  style={{ fontFamily: "'Inter', sans-serif" }}
                >
                  Photo upload will be available after registration
                </p>
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Availability */}
            <AvailabilitySchedule
              availability={data.availability}
              onChange={(availability: WeeklyAvailability) => onChange({ availability })}
            />

            {/* Amenities */}
            <div>
              <label
                className="block text-[18px] font-medium text-black mb-3"
                style={{ fontFamily: "'Urbanist', sans-serif" }}
              >
                Amenities
              </label>

              {/* Search Input */}
              <div className="relative mb-3">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-black/30" />
                <input
                  type="text"
                  placeholder="Search amenities..."
                  value={amenitySearch}
                  onChange={(e) => setAmenitySearch(e.target.value)}
                  className="
                    w-full h-[40px] pl-10 pr-4
                    bg-white border border-black/15 rounded-[20px]
                    text-[14px] text-black/80 placeholder:text-black/40
                    focus:outline-none focus:ring-1 focus:ring-[#65a4d8]/50
                  "
                  style={{ fontFamily: "'Inter', sans-serif" }}
                />
              </div>

              {/* Amenity Pills */}
              <div className="flex flex-wrap gap-2">
                {filteredAmenities.map((amenity) => {
                  const isSelected = (data.amenities || []).includes(amenity);
                  return (
                    <button
                      key={amenity}
                      type="button"
                      onClick={() => toggleAmenity(amenity)}
                      className={`
                        px-4 py-2 rounded-[55px] text-[14px] font-normal transition-all
                        ${isSelected
                          ? 'bg-[#65a4d8]/20 text-[#65a4d8] border border-[#65a4d8]'
                          : 'bg-[rgba(200,222,236,0.15)] text-black/60 border border-black/20 hover:bg-[rgba(200,222,236,0.25)]'
                        }
                      `}
                      style={{ fontFamily: "'Inter', sans-serif" }}
                    >
                      {amenity}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
