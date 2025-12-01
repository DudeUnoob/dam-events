'use client';

import { Search, MapPin, ChevronDown } from 'lucide-react';
import { useState, KeyboardEvent } from 'react';

interface DiscoverySearchProps {
    onSearch?: (query: string, location: string, eventType: string) => void;
    initialQuery?: string;
    initialLocation?: string;
    initialEventType?: string;
}

export function DiscoverySearch({
    onSearch,
    initialQuery = '',
    initialLocation = '',
    initialEventType = 'Event'
}: DiscoverySearchProps) {
    const [query, setQuery] = useState(initialQuery);
    const [location, setLocation] = useState(initialLocation);
    const [eventType, setEventType] = useState(initialEventType);

    const handleSearch = () => {
        onSearch?.(query, location, eventType);
    };

    const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            handleSearch();
        }
    };

    return (
        <div className="mx-auto max-w-4xl">
            <div className="flex items-center rounded-full bg-slate-50 border border-slate-200 shadow-sm p-1 focus-within:ring-2 focus-within:ring-slate-200 transition-all">
                {/* Search Input */}
                <div className="flex-1 flex items-center px-4 py-2 border-r border-slate-200">
                    <Search className="h-5 w-5 text-slate-400 mr-3 flex-shrink-0" />
                    <input
                        type="text"
                        placeholder="Search"
                        className="w-full bg-transparent border-none focus:outline-none text-slate-900 placeholder-slate-500"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        onKeyDown={handleKeyDown}
                    />
                </div>

                {/* Location Input */}
                <div className="flex-1 flex items-center px-4 py-2 border-r border-slate-200">
                    <MapPin className="h-5 w-5 text-slate-400 mr-3 flex-shrink-0" />
                    <input
                        type="text"
                        placeholder="Location"
                        className="w-full bg-transparent border-none focus:outline-none text-slate-900 placeholder-slate-500"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        onKeyDown={handleKeyDown}
                    />
                </div>

                {/* Event Dropdown */}
                <div className="relative px-2">
                    <button
                        onClick={handleSearch}
                        className="flex items-center gap-2 bg-slate-900 text-white px-6 py-3 rounded-full hover:bg-slate-800 transition-colors"
                    >
                        <span className="font-medium">{eventType}</span>
                        <ChevronDown className="h-4 w-4" />
                    </button>
                </div>
            </div>
        </div>
    );
}
