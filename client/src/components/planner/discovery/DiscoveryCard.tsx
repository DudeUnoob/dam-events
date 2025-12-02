'use client';

import { Heart, Star, MapPin } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { Package } from '@/types';

interface DiscoveryCardProps {
    packageData?: Package;
}

export function DiscoveryCard({ packageData }: DiscoveryCardProps) {
    if (!packageData) {
        // Return skeleton if no data
        return (
            <div className="group relative flex-shrink-0 w-[300px] bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="h-48 w-full bg-slate-200 animate-pulse" />
                <div className="p-4 space-y-3">
                    <div className="h-4 bg-slate-200 rounded animate-pulse" />
                    <div className="h-3 bg-slate-200 rounded w-2/3 animate-pulse" />
                    <div className="h-3 bg-slate-200 rounded w-1/2 animate-pulse" />
                </div>
            </div>
        );
    }

    // Extract data from package
    const title = packageData.name;
    const vendorName = packageData.vendor?.business_name || 'Vendor';
    const imageUrl = packageData.photos?.[0] || 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?ixlib=rb-4.0.3&auto=format&fit=crop&w=2098&q=80';
    const priceMin = packageData.price_min;

    // Get location from vendor
    const location = packageData.vendor?.city
        ? `${packageData.vendor.city}${packageData.vendor.state ? ', ' + packageData.vendor.state : ''}`
        : packageData.vendor?.location_address || 'Location not specified';

    // Determine package type for display
    let packageType = 'Package';
    if (packageData.venue_details) packageType = 'Venue';
    else if (packageData.catering_details) packageType = 'Catering';
    else if (packageData.entertainment_details) packageType = 'Entertainment';
    else if (packageData.rental_details) packageType = 'Rentals';

    return (
        <Link href={`/planner/package/${packageData.id}`}>
            <div className="group relative flex-shrink-0 w-[300px] bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all overflow-hidden cursor-pointer">
                {/* Image Section */}
                <div className="relative h-48 w-full">
                    <Image
                        src={imageUrl}
                        alt={title}
                        fill
                        className="object-cover"
                    />
                    {/* Heart Overlay */}
                    <button
                        className="absolute bottom-3 right-3 p-2 rounded-full bg-black/20 hover:bg-black/40 backdrop-blur-sm transition-colors"
                        onClick={(e) => {
                            e.preventDefault(); // Prevent navigation when clicking heart
                            e.stopPropagation();
                        }}
                    >
                        <Heart className="h-4 w-4 text-white" />
                    </button>

                    {/* Package Type Badge */}
                    <div className="absolute top-3 left-3 px-2 py-1 rounded-full bg-white/90 backdrop-blur-sm text-xs font-medium text-slate-700">
                        {packageType}
                    </div>
                </div>

                {/* Content Section */}
                <div className="p-4">
                    <h3 className="font-semibold text-slate-900 truncate">{vendorName}</h3>
                    <p className="text-sm text-slate-600 truncate mt-1">{title}</p>

                    <div className="flex items-center gap-1 mt-2 text-slate-500">
                        <MapPin className="h-3 w-3 flex-shrink-0" />
                        <span className="text-xs truncate">{location}</span>
                    </div>

                    {priceMin && (
                        <div className="mt-3 font-semibold text-slate-900">
                            From ${priceMin.toLocaleString()}
                        </div>
                    )}

                    {/* Capacity info if available */}
                    {packageData.capacity && (
                        <div className="mt-2 text-xs text-slate-500">
                            Up to {packageData.capacity} guests
                        </div>
                    )}
                </div>
            </div>
        </Link>
    );
}
