'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useRef } from 'react';

interface HorizontalSectionProps {
    title: string;
    children: React.ReactNode;
}

export function HorizontalSection({ title, children }: HorizontalSectionProps) {
    const scrollRef = useRef<HTMLDivElement>(null);

    const scroll = (direction: 'left' | 'right') => {
        if (scrollRef.current) {
            const scrollAmount = 382; // Card width + gap
            scrollRef.current.scrollBy({
                left: direction === 'left' ? -scrollAmount : scrollAmount,
                behavior: 'smooth',
            });
        }
    };

    return (
        <div className="py-4">
            <div className="flex items-center justify-between mb-4 px-[93px]">
                <h2 className="text-[20px] font-normal text-black">{title}</h2>
                <div className="flex gap-2">
                    <button
                        onClick={() => scroll('left')}
                        className="p-1 rounded-full border border-slate-300 hover:bg-slate-50 text-slate-600 transition-colors flex items-center justify-center"
                    >
                        <ChevronLeft className="h-[11px] w-[13px]" />
                    </button>
                    <button
                        onClick={() => scroll('right')}
                        className="p-1 rounded-full border border-slate-300 hover:bg-slate-50 text-slate-600 transition-colors flex items-center justify-center"
                    >
                        <ChevronRight className="h-[11px] w-[13px]" />
                    </button>
                </div>
            </div>

            <div
                ref={scrollRef}
                className="flex gap-5 overflow-x-auto pb-4 pl-[87px] pr-4 scrollbar-hide"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
                {children}
            </div>
        </div>
    );
}
