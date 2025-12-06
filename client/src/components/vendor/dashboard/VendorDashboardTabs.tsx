'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { User } from 'lucide-react';

// Scout Logo Icon
const ScoutIcon = () => (
  <svg width="41" height="45" viewBox="0 0 41 45" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="0" y="20" width="14.8" height="16.683" rx="2" fill="#232834" transform="rotate(-90 0 20)"/>
    <rect x="26.2" y="45" width="14.8" height="16.683" rx="2" fill="#232834" transform="rotate(-90 26.2 45)"/>
    <circle cx="9" cy="9" r="4" fill="#232834"/>
    <circle cx="20.5" cy="21" r="4" fill="#232834"/>
    <circle cx="32" cy="36" r="4" fill="#232834"/>
    <circle cx="20.5" cy="33" r="4" fill="#232834"/>
  </svg>
);

interface Tab {
  name: string;
  href: string;
}

const tabs: Tab[] = [
  { name: 'Dashboard', href: '/vendor/dashboard' },
  { name: 'Analytics', href: '/vendor/analytics' },
  { name: 'Bookings', href: '/vendor/bookings' },
  { name: 'Inbox', href: '/messages' },
];

interface VendorDashboardTabsProps {
  onProfileClick?: () => void;
}

export function VendorDashboardTabs({ onProfileClick }: VendorDashboardTabsProps) {
  const pathname = usePathname();

  const isActiveTab = (href: string) => {
    if (href === '/vendor/dashboard') {
      return pathname === '/vendor/dashboard';
    }
    return pathname?.startsWith(href);
  };

  return (
    <div className="flex items-center justify-between py-4">
      {/* Tab Navigation */}
      <div className="flex items-center gap-2">
        {tabs.map((tab) => {
          const isActive = isActiveTab(tab.href);
          return (
            <Link
              key={tab.name}
              href={tab.href}
              className={`
                px-8 py-4 rounded-[25px] text-2xl font-normal transition-colors
                font-poppins
                ${isActive
                  ? 'bg-[#232834] text-white'
                  : 'bg-[#f2f4f8] text-black hover:bg-slate-200'
                }
              `}
            >
              {tab.name}
            </Link>
          );
        })}
      </div>

      {/* Right Side - Profile & Logo */}
      <div className="flex items-center gap-4">
        {/* Profile Icon */}
        <button
          onClick={onProfileClick}
          className="flex h-[84px] w-[84px] items-center justify-center rounded-full border-2 border-[#9892c6] bg-white hover:bg-slate-50 transition-colors"
        >
          <User className="h-12 w-12 text-[#9892c6]" strokeWidth={1.5} />
        </button>

        {/* Scout Logo */}
        <div className="flex items-center gap-2">
          <ScoutIcon />
          <span className="text-5xl font-medium text-black font-urbanist">
            scout
          </span>
        </div>
      </div>
    </div>
  );
}
