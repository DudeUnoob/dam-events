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
            <div className="group relative flex-shrink-0 w-[362px] h-[237px] bg-white rounded-[10px] border border-[#545f71]/30 shadow-[0px_4px_8px_0px_rgba(0,0,0,0.25)] overflow-hidden flex">
                <div className="w-[144px] h-full bg-slate-200 animate-pulse rounded-[10px]" />
                <div className="flex-1 p-4 space-y-3">
                    <div className="h-5 bg-slate-200 rounded animate-pulse w-3/4" />
                    <div className="h-4 bg-slate-200 rounded animate-pulse w-1/2" />
                    <div className="h-3 bg-slate-200 rounded animate-pulse w-2/3" />
                </div>
            </div>
        );
    }

    // Extract data from package
    const title = packageData.name;
    const vendorName = packageData.vendor?.business_name || 'Vendor Name';
    const imageUrl = packageData.photos?.[0] || 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?ixlib=rb-4.0.3&auto=format&fit=crop&w=2098&q=80';

    // Get location from vendor
    const location = packageData.vendor?.city
        ? `${packageData.vendor.city}${packageData.vendor.state ? ', ' + packageData.vendor.state : ''}`
        : packageData.vendor?.location_address || 'Location';

    // Rating - placeholder for now (would come from reviews)
    const rating = 3.8;
    const reviewCount = 55;

    return (
        <Link href={`/planner/package/${packageData.id}`}>
            <div className="group relative flex-shrink-0 w-[362px] h-[237px] bg-white rounded-[10px] border border-[#545f71]/30 shadow-[0px_4px_8px_0px_rgba(0,0,0,0.25)] hover:shadow-[0px_6px_12px_0px_rgba(0,0,0,0.3)] transition-all overflow-hidden cursor-pointer flex">
                {/* Image Section - Left Side */}
                <div className="relative w-[144px] h-full flex-shrink-0">
                    <Image
                        src={imageUrl}
                        alt={title}
                        fill
                        className="object-cover rounded-[10px]"
                    />
                </div>

                {/* Content Section - Right Side */}
                <div className="flex-1 p-4 flex flex-col">
                    {/* Vendor Name */}
                    <h3 className="font-medium text-[20px] text-black leading-normal">
                        {vendorName}
                    </h3>

                    {/* Star Rating */}
                    <div className="flex items-center gap-1 mt-1">
                        <div className="flex">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <Star
                                    key={star}
                                    className={`h-[14px] w-[14px] ${
                                        star <= Math.floor(rating)
                                            ? 'fill-[#545f71] text-[#545f71]'
                                            : 'text-[#9ba5b7]'
                                    }`}
                                />
                            ))}
                        </div>
                        <span className="text-[10px] text-black ml-1">
                            <span className="font-semibold">{rating}</span> ({reviewCount} Reviews)
                        </span>
                    </div>

                    {/* Location */}
                    <div className="flex items-center gap-0.5 mt-1">
                        <MapPin className="h-[14px] w-[14px] text-[#545f71] flex-shrink-0" />
                        <span className="text-[10px] text-black truncate">{location}</span>
                    </div>

                    {/* Spacer */}
                    <div className="flex-1" />

                    {/* Heart Icon - Bottom */}
                    <div className="flex justify-start">
                        <button
                            className="p-1 hover:bg-slate-100 rounded-full transition-colors"
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                            }}
                        >
                            <Heart className="h-[24px] w-[24px] text-[#545f71]" />
                        </button>
                    </div>
                </div>
            </div>
        </Link>
    );
}
