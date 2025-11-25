'use client';

import { useState } from 'react';
import { ExceptionDate } from '@/types';
import { cn } from '@/lib/utils';

interface ExceptionDatesProps {
  exceptionDates: ExceptionDate[];
  onChange: (dates: ExceptionDate[]) => void;
  className?: string;
}

export function ExceptionDates({
  exceptionDates,
  onChange,
  className,
}: ExceptionDatesProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [newDate, setNewDate] = useState('');
  const [newReason, setNewReason] = useState('');

  const addException = () => {
    if (newDate && newReason.trim()) {
      // Check if date already exists
      if (exceptionDates.some((ed) => ed.date === newDate)) {
        alert('This date already has an exception.');
        return;
      }

      onChange([...exceptionDates, { date: newDate, reason: newReason.trim() }]);
      setNewDate('');
      setNewReason('');
      setShowAddForm(false);
    }
  };

  const removeException = (date: string) => {
    onChange(exceptionDates.filter((ed) => ed.date !== date));
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString + 'T00:00:00');
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  // Get today's date in YYYY-MM-DD format for min attribute
  const today = new Date().toISOString().split('T')[0];

  return (
    <div className={cn('w-full', className)}>
      <div className="mb-3 flex items-center justify-between">
        <label className="block text-sm font-medium text-slate-700">
          Exception Dates
        </label>
        {!showAddForm && (
          <button
            type="button"
            onClick={() => setShowAddForm(true)}
            className="inline-flex items-center gap-1 rounded-md bg-primary-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-primary-700"
          >
            <svg
              className="h-4 w-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
            Add Exception Date
          </button>
        )}
      </div>

      {/* Add Form */}
      {showAddForm && (
        <div className="mb-4 rounded-lg border border-slate-200 bg-slate-50 p-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                Date
              </label>
              <input
                type="date"
                value={newDate}
                onChange={(e) => setNewDate(e.target.value)}
                min={today}
                className="w-full rounded-md border border-slate-300 bg-white px-4 py-2.5 text-sm shadow-sm transition-colors hover:border-slate-400 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                Reason
              </label>
              <input
                type="text"
                value={newReason}
                onChange={(e) => setNewReason(e.target.value)}
                placeholder="e.g., Holiday, Private Event"
                className="w-full rounded-md border border-slate-300 bg-white px-4 py-2.5 text-sm shadow-sm transition-colors hover:border-slate-400 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
              />
            </div>
          </div>
          <div className="mt-3 flex gap-2">
            <button
              type="button"
              onClick={addException}
              disabled={!newDate || !newReason.trim()}
              className="rounded-md bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Add Exception
            </button>
            <button
              type="button"
              onClick={() => {
                setShowAddForm(false);
                setNewDate('');
                setNewReason('');
              }}
              className="rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Exception Dates List */}
      {exceptionDates.length > 0 ? (
        <div className="space-y-2">
          {exceptionDates
            .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
            .map((exception) => (
              <div
                key={exception.date}
                className="flex items-center justify-between rounded-lg border border-slate-200 bg-white p-3 transition-colors hover:bg-slate-50"
              >
                <div className="flex-1">
                  <p className="text-sm font-medium text-slate-900">
                    {formatDate(exception.date)}
                  </p>
                  <p className="text-xs text-slate-500">{exception.reason}</p>
                </div>
                <button
                  type="button"
                  onClick={() => removeException(exception.date)}
                  className="ml-4 rounded-md p-1.5 text-red-600 hover:bg-red-50"
                  title="Remove exception"
                >
                  <svg
                    className="h-5 w-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                </button>
              </div>
            ))}
        </div>
      ) : (
        <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-6 text-center">
          <svg
            className="mx-auto h-12 w-12 text-slate-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
          <p className="mt-2 text-sm text-slate-600">No exception dates added</p>
          <p className="text-xs text-slate-500">
            Add dates when your venue is closed (holidays, private events, etc.)
          </p>
        </div>
      )}
    </div>
  );
}
