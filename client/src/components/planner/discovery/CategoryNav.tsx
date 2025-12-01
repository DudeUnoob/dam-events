'use client';

import { Utensils, Building2, Music, Armchair, Package } from 'lucide-react';

interface CategoryNavProps {
    activeCategory?: string;
    onSelectCategory?: (category: string) => void;
}

const categories = [
    { id: 'food', label: 'Food', icon: Utensils, color: 'text-red-500', bg: 'bg-red-50' },
    { id: 'venue', label: 'Venue', icon: Building2, color: 'text-amber-500', bg: 'bg-amber-50' },
    { id: 'entertainment', label: 'Entertainment', icon: Music, color: 'text-green-500', bg: 'bg-green-50' },
    { id: 'rentals', label: 'Rentals', icon: Armchair, color: 'text-blue-500', bg: 'bg-blue-50' },
    { id: 'packages', label: 'Packages', icon: Package, color: 'text-purple-500', bg: 'bg-purple-50' },
];

export function CategoryNav({ activeCategory, onSelectCategory }: CategoryNavProps) {
    return (
        <div className="flex justify-center gap-8 py-8">
            {categories.map((category) => {
                const Icon = category.icon;
                const isActive = activeCategory === category.id;

                return (
                    <button
                        key={category.id}
                        onClick={() => onSelectCategory?.(category.id)}
                        className="group flex flex-col items-center gap-3"
                    >
                        <div
                            className={`
                h-20 w-20 rounded-full flex items-center justify-center transition-all duration-300 shadow-sm border border-slate-100
                ${isActive ? 'ring-2 ring-offset-2 ring-slate-900' : 'hover:shadow-md hover:-translate-y-1'}
                bg-white
              `}
                        >
                            <Icon
                                className={`h-8 w-8 stroke-[1.5] ${category.color}`}
                            />
                        </div>
                        <span className={`text-sm font-medium ${isActive ? 'text-slate-900' : 'text-slate-600'}`}>
                            {category.label}
                        </span>
                    </button>
                );
            })}
        </div>
    );
}
