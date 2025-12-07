'use client';

import { FoodIcon, VenueIcon, EntertainmentIcon, RentalsIcon, PackagesIcon } from '@/components/icons/CategoryIcons';

interface CategoryNavProps {
    activeCategory?: string;
    onSelectCategory?: (category: string) => void;
}

const categories = [
    { id: 'food', label: 'Food', Icon: FoodIcon },
    { id: 'venue', label: 'Venue', Icon: VenueIcon },
    { id: 'entertainment', label: 'Entertainment', Icon: EntertainmentIcon },
    { id: 'rentals', label: 'Rentals', Icon: RentalsIcon },
    { id: 'packages', label: 'Packages', Icon: PackagesIcon },
];

export function CategoryNav({ activeCategory, onSelectCategory }: CategoryNavProps) {
    return (
        <div className="flex justify-center gap-[14px] py-6">
            {categories.map((category) => {
                const Icon = category.Icon;
                const isActive = activeCategory === category.id;

                return (
                    <button
                        key={category.id}
                        onClick={() => onSelectCategory?.(category.id)}
                        className="group flex flex-col items-center gap-[14px] w-[209px]"
                    >
                        <div
                            className={`
                                h-[127px] w-[127px] rounded-full flex items-center justify-center
                                bg-white shadow-[0px_4px_10px_0px_rgba(0,0,0,0.25)]
                                transition-all duration-300
                                ${isActive ? 'ring-2 ring-offset-2 ring-[#232834]' : 'hover:shadow-[0px_6px_14px_0px_rgba(0,0,0,0.3)] hover:-translate-y-1'}
                            `}
                        >
                            <Icon />
                        </div>
                        <span className={`text-[16px] font-normal text-black text-center`}>
                            {category.label}
                        </span>
                    </button>
                );
            })}
        </div>
    );
}
