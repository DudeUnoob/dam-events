'use client';

import { ChevronsUpDown } from 'lucide-react';
import { useState } from 'react';

interface FilterBarProps {
    filters: {
        price: string;
        availability: string;
        occasion: string;
        guest_count: string;
    };
    onFilterChange: (key: string, value: string) => void;
    onClearFilters: () => void;
}

const FilterDropdown = ({
    label,
    value,
    options,
    onChange,
}: {
    label: string;
    value: string;
    options: { value: string; label: string }[];
    onChange: (value: string) => void;
}) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-1 px-4 py-2 text-[16px] text-black font-normal hover:bg-slate-50 rounded-[30px] transition-colors"
            >
                <ChevronsUpDown className="h-[14px] w-[14px] text-[#545f71]" />
                <span>{value ? options.find(o => o.value === value)?.label : label}</span>
            </button>

            {isOpen && (
                <>
                    <div
                        className="fixed inset-0 z-10"
                        onClick={() => setIsOpen(false)}
                    />
                    <div className="absolute top-full left-0 mt-1 z-20 bg-white rounded-lg shadow-lg border border-slate-200 min-w-[150px]">
                        <button
                            onClick={() => {
                                onChange('');
                                setIsOpen(false);
                            }}
                            className="w-full px-4 py-2 text-left text-sm hover:bg-slate-50 text-slate-500"
                        >
                            All
                        </button>
                        {options.map((option) => (
                            <button
                                key={option.value}
                                onClick={() => {
                                    onChange(option.value);
                                    setIsOpen(false);
                                }}
                                className={`w-full px-4 py-2 text-left text-sm hover:bg-slate-50 ${
                                    value === option.value ? 'bg-slate-100 font-medium' : ''
                                }`}
                            >
                                {option.label}
                            </button>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
};

const VerticalDivider = () => (
    <div className="h-[53px] w-px bg-[#9ba5b7]" />
);

export function FilterBar({ filters, onFilterChange, onClearFilters }: FilterBarProps) {
    const priceOptions = [
        { value: '0-2000', label: 'Under $2,000' },
        { value: '2000-4000', label: '$2,000 - $4,000' },
        { value: '4000-6000', label: '$4,000 - $6,000' },
        { value: '6000+', label: '$6,000+' },
    ];

    const availabilityOptions = [
        { value: 'today', label: 'Today' },
        { value: 'this-week', label: 'This Week' },
        { value: 'this-month', label: 'This Month' },
        { value: 'next-month', label: 'Next Month' },
    ];

    const occasionOptions = [
        { value: 'wedding', label: 'Wedding' },
        { value: 'corporate', label: 'Corporate' },
        { value: 'party', label: 'Party' },
        { value: 'other', label: 'Other' },
    ];

    const guestCountOptions = [
        { value: '0-50', label: 'Up to 50' },
        { value: '50-100', label: '50 - 100' },
        { value: '100-200', label: '100 - 200' },
        { value: '200+', label: '200+' },
    ];

    return (
        <div className="flex justify-center items-center py-4">
            <div className="flex items-center bg-[#f2f4f8] rounded-[30px] px-6 h-[64px]">
                <FilterDropdown
                    label="Price"
                    value={filters.price}
                    options={priceOptions}
                    onChange={(value) => onFilterChange('price', value)}
                />

                <VerticalDivider />

                <FilterDropdown
                    label="Availability"
                    value={filters.availability}
                    options={availabilityOptions}
                    onChange={(value) => onFilterChange('availability', value)}
                />

                <VerticalDivider />

                <FilterDropdown
                    label="Occasion"
                    value={filters.occasion}
                    options={occasionOptions}
                    onChange={(value) => onFilterChange('occasion', value)}
                />

                <VerticalDivider />

                <FilterDropdown
                    label="Guest Count"
                    value={filters.guest_count}
                    options={guestCountOptions}
                    onChange={(value) => onFilterChange('guest_count', value)}
                />

                <VerticalDivider />

                <button
                    onClick={onClearFilters}
                    className="flex items-center gap-1 px-4 py-2 text-[16px] text-black font-normal hover:bg-slate-100 rounded-[30px] transition-colors"
                >
                    <ChevronsUpDown className="h-[14px] w-[14px] text-[#545f71]" />
                    <span>All Filters</span>
                </button>
            </div>
        </div>
    );
}
