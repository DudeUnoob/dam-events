'use client';

import { useState, useRef, useEffect } from 'react';
import { COMMON_AMENITIES } from '@/types';
import { cn } from '@/lib/utils';

interface AmenitySearchProps {
  selectedAmenities: string[];
  onChange: (amenities: string[]) => void;
  placeholder?: string;
  className?: string;
}

export function AmenitySearch({
  selectedAmenities,
  onChange,
  placeholder = 'Search amenities...',
  className,
}: AmenitySearchProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [customAmenity, setCustomAmenity] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Filter amenities based on search term
  const filteredAmenities = COMMON_AMENITIES.filter(
    (amenity) =>
      amenity.toLowerCase().includes(searchTerm.toLowerCase()) &&
      !selectedAmenities.includes(amenity)
  );

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setShowDropdown(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const addAmenity = (amenity: string) => {
    if (!selectedAmenities.includes(amenity)) {
      onChange([...selectedAmenities, amenity]);
    }
    setSearchTerm('');
    setShowDropdown(false);
    inputRef.current?.focus();
  };

  const removeAmenity = (amenity: string) => {
    onChange(selectedAmenities.filter((a) => a !== amenity));
  };

  const addCustomAmenity = () => {
    const trimmed = customAmenity.trim();
    if (trimmed && !selectedAmenities.includes(trimmed)) {
      onChange([...selectedAmenities, trimmed]);
      setCustomAmenity('');
      setSearchTerm('');
      setShowDropdown(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredAmenities.length === 1) {
        addAmenity(filteredAmenities[0]);
      } else if (searchTerm.trim()) {
        setCustomAmenity(searchTerm);
      }
    }
  };

  return (
    <div className={cn('w-full', className)}>
      <label className="mb-1.5 block text-sm font-medium text-slate-700">
        Amenities
      </label>

      {/* Search Input */}
      <div className="relative">
        <div className="relative">
          <input
            ref={inputRef}
            type="text"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setShowDropdown(true);
            }}
            onFocus={() => setShowDropdown(true)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            className="w-full rounded-md border border-slate-300 bg-white px-4 py-2.5 pl-10 text-sm shadow-sm transition-colors hover:border-slate-400 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
          />
          {/* Search Icon */}
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <svg
              className="h-5 w-5 text-slate-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
        </div>

        {/* Dropdown */}
        {showDropdown && (filteredAmenities.length > 0 || searchTerm) && (
          <div
            ref={dropdownRef}
            className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md border border-slate-200 bg-white shadow-lg"
          >
            {/* Filtered Amenities */}
            {filteredAmenities.length > 0 ? (
              <div className="py-1">
                {filteredAmenities.map((amenity) => (
                  <button
                    key={amenity}
                    type="button"
                    onClick={() => addAmenity(amenity)}
                    className="w-full px-4 py-2 text-left text-sm text-slate-700 hover:bg-primary-50 hover:text-primary-700"
                  >
                    {amenity}
                  </button>
                ))}
              </div>
            ) : searchTerm ? (
              <div className="px-4 py-3">
                <p className="text-sm text-slate-500">
                  No matching amenities found.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setCustomAmenity(searchTerm);
                    addCustomAmenity();
                  }}
                  className="mt-2 text-sm font-medium text-primary-600 hover:text-primary-700"
                >
                  Add &quot;{searchTerm}&quot; as custom amenity
                </button>
              </div>
            ) : null}
          </div>
        )}
      </div>

      {/* Selected Amenities as Badges */}
      {selectedAmenities.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {selectedAmenities.map((amenity) => (
            <span
              key={amenity}
              className="inline-flex items-center gap-1.5 rounded-full border border-primary-200 bg-primary-50 px-3 py-1 text-sm text-primary-700"
            >
              {amenity}
              <button
                type="button"
                onClick={() => removeAmenity(amenity)}
                className="inline-flex h-4 w-4 items-center justify-center rounded-full hover:bg-primary-200"
              >
                <svg
                  className="h-3 w-3"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </span>
          ))}
        </div>
      )}

      <p className="mt-2 text-xs text-slate-500">
        Select from common amenities or add your own custom amenities
      </p>
    </div>
  );
}
