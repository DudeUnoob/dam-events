'use client';

interface CategoryNavProps {
    activeCategory?: string;
    onSelectCategory?: (category: string) => void;
}

// Custom SVG Icons matching the Figma design
const FoodIcon = () => (
    <svg width="63" height="62" viewBox="0 0 63 62" fill="none" xmlns="http://www.w3.org/2000/svg">
        <ellipse cx="28.3845" cy="38.556" rx="28.3845" ry="19.278" fill="#E0D072" fillOpacity="0.8"/>
        <path d="M28 8C28 8 35 12 35 18C35 24 28 28 28 28" stroke="#E0D072" strokeWidth="4" strokeLinecap="round"/>
        <circle cx="28" cy="28" r="6" fill="#E0D072"/>
    </svg>
);

const VenueIcon = () => (
    <svg width="69" height="65" viewBox="0 0 69 65" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="8" y="20" width="53" height="37" rx="2" fill="#E0D072" fillOpacity="0.9"/>
        <rect x="15" y="28" width="12" height="12" rx="1" fill="white"/>
        <rect x="42" y="28" width="12" height="12" rx="1" fill="white"/>
        <rect x="15" y="44" width="12" height="12" rx="1" fill="white"/>
        <rect x="42" y="44" width="12" height="12" rx="1" fill="white"/>
        <rect x="28" y="8" width="13" height="12" rx="1" fill="#E0D072"/>
    </svg>
);

const EntertainmentIcon = () => (
    <svg width="80" height="80" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="40" cy="40" r="30" fill="white" stroke="#9BD4A0" strokeWidth="3"/>
        <path d="M35 25V55L55 40L35 25Z" fill="#9BD4A0"/>
        <rect x="50" y="20" width="8" height="25" rx="2" fill="#9BD4A0"/>
        <rect x="50" y="50" width="8" height="8" rx="2" fill="#9BD4A0"/>
    </svg>
);

const RentalsIcon = () => (
    <svg width="75" height="76" viewBox="0 0 75 76" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M20 30H55V35H20V30Z" fill="#6D9EC8"/>
        <path d="M25 35V60H30V35H25Z" fill="#6D9EC8"/>
        <path d="M45 35V60H50V35H45Z" fill="#6D9EC8"/>
        <path d="M15 60H60V65H15V60Z" fill="#6D9EC8"/>
        <rect x="22" y="15" width="31" height="15" rx="7" fill="#6D9EC8"/>
    </svg>
);

const PackagesIcon = () => (
    <svg width="77" height="77" viewBox="0 0 77 77" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M38.5 8L68 23V54L38.5 69L9 54V23L38.5 8Z" stroke="#9892C6" strokeWidth="3" fill="none"/>
        <path d="M38.5 8V69" stroke="#9892C6" strokeWidth="2"/>
        <path d="M9 23L38.5 38.5L68 23" stroke="#9892C6" strokeWidth="2"/>
        <circle cx="38.5" cy="38.5" r="6" fill="#9892C6"/>
    </svg>
);

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
