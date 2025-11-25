'use client';

import { useState } from 'react';
import { EventTypesData, EVENT_TYPES } from '@/types';
import { cn } from '@/lib/utils';

interface EventTypesProps {
  data: EventTypesData;
  onChange: (data: EventTypesData) => void;
}

export function EventTypes({ data, onChange }: EventTypesProps) {
  const [customEventType, setCustomEventType] = useState('');

  const toggleEventType = (eventType: string) => {
    const isSelected = data.event_types.includes(eventType);
    if (isSelected) {
      onChange({
        event_types: data.event_types.filter((et) => et !== eventType),
      });
    } else {
      onChange({
        event_types: [...data.event_types, eventType],
      });
    }
  };

  const addCustomEventType = () => {
    const trimmed = customEventType.trim();
    if (trimmed && !data.event_types.includes(trimmed)) {
      onChange({
        event_types: [...data.event_types, trimmed],
      });
      setCustomEventType('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addCustomEventType();
    }
  };

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-12">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-slate-900">
          What type of events do you host?
        </h1>
        <p className="mt-4 text-lg text-slate-600">
          Select all event types that apply to your venue
        </p>
      </div>

      <div className="mt-12 rounded-2xl bg-gradient-to-br from-primary-50 to-slate-50 p-8 shadow-sm">
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {EVENT_TYPES.map((eventType) => {
            const isSelected = data.event_types.includes(eventType);

            // Handle "Other" specially
            if (eventType === 'Other') {
              return (
                <div key={eventType} className="col-span-2 md:col-span-4">
                  <div className="flex items-center gap-3">
                    <label
                      className={cn(
                        'flex flex-1 cursor-pointer items-center gap-3 rounded-lg border-2 p-4 transition-all',
                        isSelected
                          ? 'border-primary-500 bg-primary-50'
                          : 'border-slate-200 bg-white hover:border-primary-300'
                      )}
                    >
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleEventType(eventType)}
                        className="h-5 w-5 rounded border-slate-300 text-primary-600 focus:ring-2 focus:ring-primary-500/20"
                      />
                      <span
                        className={cn(
                          'text-sm font-medium',
                          isSelected ? 'text-primary-700' : 'text-slate-700'
                        )}
                      >
                        {eventType}
                      </span>
                    </label>
                    <input
                      type="text"
                      value={customEventType}
                      onChange={(e) => setCustomEventType(e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder="Specify custom event type"
                      className="flex-1 rounded-lg border border-slate-300 px-4 py-3 text-sm shadow-sm transition-colors hover:border-slate-400 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                    />
                    <button
                      type="button"
                      onClick={addCustomEventType}
                      disabled={!customEventType.trim()}
                      className="rounded-lg bg-primary-600 px-6 py-3 text-sm font-medium text-white hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      Add
                    </button>
                  </div>
                </div>
              );
            }

            return (
              <label
                key={eventType}
                className={cn(
                  'flex cursor-pointer items-center gap-3 rounded-lg border-2 p-4 transition-all',
                  isSelected
                    ? 'border-primary-500 bg-primary-50'
                    : 'border-slate-200 bg-white hover:border-primary-300'
                )}
              >
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => toggleEventType(eventType)}
                  className="h-5 w-5 rounded border-slate-300 text-primary-600 focus:ring-2 focus:ring-primary-500/20"
                />
                <span
                  className={cn(
                    'text-sm font-medium',
                    isSelected ? 'text-primary-700' : 'text-slate-700'
                  )}
                >
                  {eventType}
                </span>
              </label>
            );
          })}
        </div>

        {data.event_types.length > 0 && (
          <div className="mt-6">
            <p className="mb-2 text-sm font-medium text-slate-700">
              Selected Event Types:
            </p>
            <div className="flex flex-wrap gap-2">
              {data.event_types.map((eventType) => (
                <span
                  key={eventType}
                  className="inline-flex items-center gap-1.5 rounded-full border border-primary-200 bg-primary-100 px-3 py-1 text-sm font-medium text-primary-700"
                >
                  {eventType}
                  <button
                    type="button"
                    onClick={() => toggleEventType(eventType)}
                    className="inline-flex h-4 w-4 items-center justify-center rounded-full hover:bg-primary-200"
                  >
                    <svg
                      className="h-3 w-3"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
