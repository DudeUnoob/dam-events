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
    const [showEventDropdown, setShowEventDropdown] = useState(false);

    const eventTypes = ['Event', 'Wedding', 'Corporate', 'Party', 'Birthday', 'Other'];

    const handleSearch = () => {
        onSearch?.(query, location, eventType);
    };

    const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            handleSearch();
        }
    };

    return (
        <div className="mx-auto max-w-[1144px]">
            <div className="relative flex items-center h-[65px] rounded-[30px] border border-[#9ba5b7]/30 bg-white">
                {/* Search Input Section */}
                <div className="flex-1 flex items-center h-[55px] ml-[5px] bg-[#f2f4f8] rounded-[30px] border border-[#ebedf1]/50">
                    <div className="flex items-center gap-[10px] px-[20px] py-[14px]">
                        <Search className="h-[25px] w-[24px] text-black flex-shrink-0" />
                        <input
                            type="text"
                            placeholder="Search"
                            className="w-full bg-transparent border-none focus:outline-none text-[15px] text-black placeholder-black font-normal leading-[26px]"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            onKeyDown={handleKeyDown}
                        />
                    </div>
                </div>

                {/* Location Input Section */}
                <div className="flex items-center h-[55px] w-[228px] bg-[#f2f4f8] rounded-[30px] ml-[8px]">
                    <div className="flex items-center gap-[7px] px-[18px] py-[11px]">
                        <MapPin className="h-[31px] w-[31px] text-black flex-shrink-0" strokeWidth={1.5} />
                        <input
                            type="text"
                            placeholder="Location"
                            className="w-[154px] bg-transparent border-none focus:outline-none text-[15px] text-black placeholder-black font-normal leading-[26px]"
                            value={location}
                            onChange={(e) => setLocation(e.target.value)}
                            onKeyDown={handleKeyDown}
                        />
                    </div>
                </div>

                {/* Event Button Section */}
                <div className="relative h-[55px] w-[136px] ml-[8px] mr-[5px]">
                    <button
                        onClick={() => setShowEventDropdown(!showEventDropdown)}
                        className="flex items-center justify-center gap-2 h-full w-full bg-[#232834] rounded-[30px] text-white"
                    >
                        <span className="text-[15px] font-normal leading-[26px]">{eventType}</span>
                        <ChevronDown className="h-[31px] w-[31px]" strokeWidth={1.5} />
                    </button>

                    {showEventDropdown && (
                        <>
                            <div
                                className="fixed inset-0 z-10"
                                onClick={() => setShowEventDropdown(false)}
                            />
                            <div className="absolute top-full right-0 mt-2 z-20 bg-white rounded-lg shadow-lg border border-slate-200 min-w-[180px]">
                                {eventTypes.map((type) => (
                                    <button
                                        key={type}
                                        onClick={() => {
                                            setEventType(type);
                                            setShowEventDropdown(false);
                                            handleSearch();
                                        }}
                                        className={`w-full px-4 py-2.5 text-left text-sm hover:bg-slate-50 ${
                                            eventType === type ? 'bg-slate-100 font-medium' : ''
                                        }`}
                                    >
                                        {type}
                                    </button>
                                ))}
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
