
'use client';

import { ChevronDown, ChevronsUpDown, X } from 'lucide-react';
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

export function FilterBar({ filters, onFilterChange, onClearFilters }: FilterBarProps) {
    const activeCount = Object.values(filters).filter(Boolean).length;

    return (
        <div className="flex flex-wrap justify-center gap-4 py-4 border-y border-slate-100 bg-white/50 backdrop-blur-sm sticky top-0 z-10">
            {/* Price Filter */}
            <div className="relative group">
                <select
                    value={filters.price}
                    onChange={(e) => onFilterChange('price', e.target.value)}
                    className="appearance-none pl-5 pr-10 py-2.5 rounded-full border border-slate-200 bg-white text-sm font-medium text-slate-700 hover:border-slate-300 hover:bg-slate-50 transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-200 cursor-pointer"
                >
                    <option value="">Price</option>
                    <option value="0-2000">Under $2,000</option>
                    <option value="2000-4000">$2,000 - $4,000</option>
                    <option value="4000-6000">$4,000 - $6,000</option>
                    <option value="6000+">$6,000+</option>
                </select>
                <ChevronsUpDown className="absolute right-3 top-1/2 -translate-y-1/2 h-3 w-3 text-slate-400 pointer-events-none" />
            </div>

            {/* Guest Count Filter */}
            <div className="relative group">
                <select
                    value={filters.guest_count}
                    onChange={(e) => onFilterChange('guest_count', e.target.value)}
                    className="appearance-none pl-5 pr-10 py-2.5 rounded-full border border-slate-200 bg-white text-sm font-medium text-slate-700 hover:border-slate-300 hover:bg-slate-50 transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-200 cursor-pointer"
                >
                    <option value="">Guest Count</option>
                    <option value="0-50">Up to 50</option>
                    <option value="50-100">50 - 100</option>
                    <option value="100-200">100 - 200</option>
                    <option value="200+">200+</option>
                </select>
                <ChevronsUpDown className="absolute right-3 top-1/2 -translate-y-1/2 h-3 w-3 text-slate-400 pointer-events-none" />
            </div>

            {/* Occasion Filter */}
            <div className="relative group">
                <select
                    value={filters.occasion}
                    onChange={(e) => onFilterChange('occasion', e.target.value)}
                    className="appearance-none pl-5 pr-10 py-2.5 rounded-full border border-slate-200 bg-white text-sm font-medium text-slate-700 hover:border-slate-300 hover:bg-slate-50 transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-200 cursor-pointer"
                >
                    <option value="">Occasion</option>
                    <option value="wedding">Wedding</option>
                    <option value="corporate">Corporate</option>
                    <option value="party">Party</option>
                    <option value="other">Other</option>
                </select>
                <ChevronsUpDown className="absolute right-3 top-1/2 -translate-y-1/2 h-3 w-3 text-slate-400 pointer-events-none" />
            </div>

            {/* Clear Filters */}
            {activeCount > 0 && (
                <button
                    onClick={onClearFilters}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-full border border-red-100 bg-red-50 text-sm font-medium text-red-600 hover:bg-red-100 transition-colors"
                >
                    <X className="h-3 w-3" />
                    Clear ({activeCount})
                </button>
            )}
        </div>
    );
}

