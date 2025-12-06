'use client';

import { WeeklyAvailability, DayOfWeek, DAYS_OF_WEEK } from '@/types';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AvailabilityScheduleProps {
  availability: WeeklyAvailability;
  onChange: (availability: WeeklyAvailability) => void;
  className?: string;
}

const DAY_LABELS: Record<DayOfWeek, string> = {
  monday: 'Mon',
  tuesday: 'Tue',
  wednesday: 'Wed',
  thursday: 'Thu',
  friday: 'Fri',
  saturday: 'Sat',
  sunday: 'Sun',
};

// Generate time options in 30-minute increments
function generateTimeOptions(): string[] {
  const times: string[] = [];
  for (let hour = 6; hour <= 23; hour++) {
    ['00', '30'].forEach((minute) => {
      const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
      const period = hour >= 12 ? 'PM' : 'AM';
      times.push(`${displayHour}:${minute} ${period}`);
    });
  }
  return times;
}

const TIME_OPTIONS = generateTimeOptions();

// Figma-styled time select
function FigmaTimeSelect({
  value,
  onChange,
  disabled,
}: {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className={cn(
          'appearance-none w-full h-[38px] px-3 pr-8',
          'bg-white border border-black/20 rounded-[8px]',
          'text-[14px] text-black/80',
          'focus:outline-none focus:ring-1 focus:ring-[#65a4d8]/50',
          'disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed'
        )}
        style={{ fontFamily: "'Inter', sans-serif" }}
      >
        {TIME_OPTIONS.map((time) => (
          <option key={time} value={time}>
            {time}
          </option>
        ))}
      </select>
      <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-black/40 pointer-events-none" />
    </div>
  );
}

export function AvailabilitySchedule({
  availability,
  onChange,
  className,
}: AvailabilityScheduleProps) {
  const updateDay = (
    day: DayOfWeek,
    field: 'isOpen' | 'openTime' | 'closeTime',
    value: boolean | string
  ) => {
    onChange({
      ...availability,
      [day]: {
        ...availability[day],
        [field]: value,
      },
    });
  };

  return (
    <div className={cn('w-full', className)}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3
          className="text-lg md:text-xl font-medium text-black"
          style={{ fontFamily: "'Urbanist', sans-serif" }}
        >
          Availability Schedule
        </h3>
      </div>

      {/* Table */}
      <div className="rounded-[12px] border border-black/10 overflow-hidden">
        {/* Header Row */}
        <div className="grid grid-cols-3 bg-[#f8f9fb] border-b border-black/10">
          <div className="px-4 py-3">
            <span
              className="inline-block bg-[#e8eef4] rounded-full px-4 py-1 text-[13px] font-medium text-black/70"
              style={{ fontFamily: "'Inter', sans-serif" }}
            >
              Day
            </span>
          </div>
          <div className="px-4 py-3 text-center">
            <span
              className="inline-block bg-[#e8eef4] rounded-full px-4 py-1 text-[13px] font-medium text-black/70"
              style={{ fontFamily: "'Inter', sans-serif" }}
            >
              Open
            </span>
          </div>
          <div className="px-4 py-3 text-center">
            <span
              className="inline-block bg-[#e8eef4] rounded-full px-4 py-1 text-[13px] font-medium text-black/70"
              style={{ fontFamily: "'Inter', sans-serif" }}
            >
              Close
            </span>
          </div>
        </div>

        {/* Day Rows */}
        {DAYS_OF_WEEK.map((day) => {
          const dayData = availability[day];
          return (
            <div
              key={day}
              className={cn(
                'grid grid-cols-3 border-b border-black/5 last:border-b-0',
                dayData.isOpen ? 'bg-white' : 'bg-slate-50/50'
              )}
            >
              {/* Day Name with Toggle */}
              <div className="px-4 py-3 flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={dayData.isOpen}
                  onChange={(e) => updateDay(day, 'isOpen', e.target.checked)}
                  className="h-4 w-4 rounded border-slate-300 text-[#65a4d8] focus:ring-[#65a4d8]/20"
                />
                <span
                  className={cn(
                    'text-[14px] font-medium',
                    dayData.isOpen ? 'text-black' : 'text-black/40'
                  )}
                  style={{ fontFamily: "'Inter', sans-serif" }}
                >
                  {DAY_LABELS[day]}
                </span>
              </div>

              {/* Open Time */}
              <div className="px-3 py-2">
                <FigmaTimeSelect
                  value={dayData.openTime}
                  onChange={(val) => updateDay(day, 'openTime', val)}
                  disabled={!dayData.isOpen}
                />
              </div>

              {/* Close Time */}
              <div className="px-3 py-2">
                <FigmaTimeSelect
                  value={dayData.closeTime}
                  onChange={(val) => updateDay(day, 'closeTime', val)}
                  disabled={!dayData.isOpen}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Exception Dates Link */}
      <button
        type="button"
        className="mt-3 text-[14px] text-[#65a4d8] hover:underline"
        style={{ fontFamily: "'Inter', sans-serif" }}
      >
        + Add Exception Dates
      </button>
    </div>
  );
}
