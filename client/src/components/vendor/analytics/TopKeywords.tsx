'use client';

import { ServiceType } from '@/types';

interface TopKeywordsProps {
  serviceType: ServiceType;
  className?: string;
}

// Mock keywords by service type
const keywordsByService: Record<ServiceType, Array<{ keyword: string; searches: number; color: string }>> = {
  venue: [
    { keyword: '"Wedding Venue Austin"', searches: 325, color: '#539dda' },
    { keyword: '"Rooftop Event Space"', searches: 218, color: '#4ade80' },
    { keyword: '"Corporate Event"', searches: 142, color: '#f87171' },
  ],
  catering: [
    { keyword: '"Austin Wedding Catering"', searches: 325, color: '#539dda' },
    { keyword: '"Corporate Event Buffet"', searches: 218, color: '#4ade80' },
    { keyword: '"Dessert Catering Austin"', searches: 142, color: '#f87171' },
  ],
  entertainment: [
    { keyword: '"Austin Wedding Acoustics"', searches: 325, color: '#539dda' },
    { keyword: '"Corporate Gala Singers"', searches: 218, color: '#4ade80' },
    { keyword: '"Sweet Sixteen Musicians"', searches: 142, color: '#f87171' },
  ],
  rentals: [
    { keyword: '"Wedding Chair Rentals Austin"', searches: 325, color: '#539dda' },
    { keyword: '"Tent & Lighting Packages"', searches: 218, color: '#4ade80' },
    { keyword: '"Corporate Event Tables"', searches: 142, color: '#f87171' },
  ],
};

export function TopKeywords({ serviceType, className }: TopKeywordsProps) {
  const keywords = keywordsByService[serviceType];

  return (
    <div className={`bg-[rgba(224,219,255,0.2)] border border-[rgba(0,0,0,0.1)] rounded-[15px] p-6 ${className}`}>
      <h4 className="text-xl font-medium text-black font-poppins mb-4">
        Top Search Keywords
      </h4>
      <ul className="space-y-3">
        {keywords.map((item, i) => (
          <li key={i} className="flex items-center gap-2">
            <span
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: item.color }}
            />
            <span className="text-base text-black font-manrope">
              {item.keyword}
            </span>
            <span className="text-base text-slate-500">
              - {item.searches} Searches
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
