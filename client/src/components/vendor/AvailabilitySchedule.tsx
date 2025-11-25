'use client';

import { WeeklyAvailability, DayOfWeek, DAYS_OF_WEEK } from '@/types';
import { TimeSelect } from '@/components/ui/TimeSelect';
import { cn } from '@/lib/utils';

interface AvailabilityScheduleProps {
  availability: WeeklyAvailability;
  onChange: (availability: WeeklyAvailability) => void;
  className?: string;
}

const DAY_LABELS: Record<DayOfWeek, string> = {
  monday: 'Monday',
  tuesday: 'Tuesday',
  wednesday: 'Wednesday',
  thursday: 'Thursday',
  friday: 'Friday',
  saturday: 'Saturday',
  sunday: 'Sunday',
};

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

  const applyToAllDays = (template: 'weekdays' | 'weekend' | 'all') => {
    const defaultOpen = availability.monday.isOpen
      ? availability.monday
      : { isOpen: true, openTime: '9:00 AM', closeTime: '5:00 PM' };

    const newAvailability = { ...availability };

    if (template === 'all') {
      DAYS_OF_WEEK.forEach((day) => {
        newAvailability[day] = { ...defaultOpen };
      });
    } else if (template === 'weekdays') {
      (['monday', 'tuesday', 'wednesday', 'thursday', 'friday'] as DayOfWeek[]).forEach(
        (day) => {
          newAvailability[day] = { ...defaultOpen };
        }
      );
    } else if (template === 'weekend') {
      (['saturday', 'sunday'] as DayOfWeek[]).forEach((day) => {
        newAvailability[day] = { ...defaultOpen };
      });
    }

    onChange(newAvailability);
  };

  return (
    <div className={cn('w-full', className)}>
      <div className="mb-4 flex items-center justify-between">
        <label className="block text-sm font-medium text-slate-700">
          Availability Schedule
        </label>

        {/* Quick Apply Buttons */}
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => applyToAllDays('weekdays')}
            className="rounded-md border border-slate-300 bg-white px-3 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50"
          >
            Apply to Weekdays
          </button>
          <button
            type="button"
            onClick={() => applyToAllDays('weekend')}
            className="rounded-md border border-slate-300 bg-white px-3 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50"
          >
            Apply to Weekend
          </button>
          <button
            type="button"
            onClick={() => applyToAllDays('all')}
            className="rounded-md border border-slate-300 bg-white px-3 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50"
          >
            Apply to All
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-lg border border-slate-200">
        <table className="w-full">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">
                Day
              </th>
              <th className="px-4 py-3 text-center text-sm font-semibold text-slate-700">
                Open
              </th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">
                Open Time
              </th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">
                Close Time
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {DAYS_OF_WEEK.map((day) => {
              const dayData = availability[day];
              return (
                <tr
                  key={day}
                  className={cn(
                    'transition-colors',
                    dayData.isOpen ? 'bg-white' : 'bg-slate-50'
                  )}
                >
                  {/* Day Name */}
                  <td className="px-4 py-3 text-sm font-medium text-slate-700">
                    {DAY_LABELS[day]}
                  </td>

                  {/* Open Checkbox */}
                  <td className="px-4 py-3 text-center">
                    <input
                      type="checkbox"
                      checked={dayData.isOpen}
                      onChange={(e) => updateDay(day, 'isOpen', e.target.checked)}
                      className="h-4 w-4 rounded border-slate-300 text-primary-600 focus:ring-2 focus:ring-primary-500/20"
                    />
                  </td>

                  {/* Open Time */}
                  <td className="px-4 py-3">
                    <TimeSelect
                      value={dayData.openTime}
                      onChange={(e) => updateDay(day, 'openTime', e.target.value)}
                      disabled={!dayData.isOpen}
                      className="w-full max-w-[160px]"
                    />
                  </td>

                  {/* Close Time */}
                  <td className="px-4 py-3">
                    <TimeSelect
                      value={dayData.closeTime}
                      onChange={(e) => updateDay(day, 'closeTime', e.target.value)}
                      disabled={!dayData.isOpen}
                      className="w-full max-w-[160px]"
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <p className="mt-2 text-xs text-slate-500">
        Set your venue&apos;s availability for each day of the week. Use the quick apply
        buttons to set the same hours for multiple days.
      </p>
    </div>
  );
}
