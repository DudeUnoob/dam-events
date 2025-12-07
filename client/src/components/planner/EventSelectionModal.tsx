'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Event } from '@/types';
import { formatDate, formatCurrency } from '@/lib/utils';
import { Calendar, Users, DollarSign, MapPin, Plus, Loader2 } from 'lucide-react';
import { useToast } from '@/components/ui/Toast';

export interface EventSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectEvent: (eventId: string) => void;
  packageId?: string;
}

export function EventSelectionModal({
  isOpen,
  onClose,
  onSelectEvent,
  packageId,
}: EventSelectionModalProps) {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const router = useRouter();
  const { showToast } = useToast();

  const fetchActiveEvents = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/events?status=active');
      const data = await response.json();

      if (response.ok && data.data) {
        setEvents(data.data);
      } else {
        throw new Error(data.error?.message || 'Failed to fetch events');
      }
    } catch (err: any) {
      console.error('Error fetching events:', err);
      showToast(err.message || 'Failed to load events', 'error');
      setEvents([]);
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    if (isOpen) {
      fetchActiveEvents();
    }
  }, [isOpen, fetchActiveEvents]);

  const handleSelectEvent = () => {
    if (selectedEventId) {
      onSelectEvent(selectedEventId);
      onClose();
    }
  };

  const handleCreateNewEvent = () => {
    // Close modal and redirect to create event with return URL
    onClose();

    // Set flag to auto-submit quote when returning from event creation
    if (packageId) {
      sessionStorage.setItem(`autoSubmitQuote_${packageId}`, 'true');
    }

    const returnUrl = packageId ? `/packages/${packageId}` : '/planner/browse';
    router.push(`/planner/events/create?returnTo=${encodeURIComponent(returnUrl)}`);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Select an Event" size="lg">
      <div className="space-y-4">
        <p className="text-sm text-slate-600 text-center">
          Choose an event to request a quote for, or create a new event.
        </p>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
          </div>
        ) : events.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 max-h-[420px] overflow-y-auto">
            {events.map((event) => {
              const isSelected = selectedEventId === event.id;
              return (
                <button
                  key={event.id}
                  onClick={() => setSelectedEventId(event.id)}
                  className={`text-left rounded-[15px] border px-4 py-3 transition-all ${
                    isSelected
                      ? 'border-[#232834] bg-slate-50 shadow-sm'
                      : 'border-slate-200 bg-white hover:border-slate-400'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-sm font-medium text-slate-900 truncate">
                      {event.event_type || 'Event Name'}
                    </p>
                    <span className="inline-flex items-center rounded-[10px] bg-[#bfeab4] px-2 py-0.5 text-[10px] font-medium text-slate-800">
                      Active
                    </span>
                  </div>

                  <div className="mt-1 grid grid-cols-[auto,1fr] gap-x-2 gap-y-1 text-[10px] text-black">
                    <Calendar className="h-4 w-4 text-[#545f71]" />
                    <span>{formatDate(event.event_date)}</span>

                    <Users className="h-4 w-4 text-[#545f71]" />
                    <span>{event.guest_count} guests</span>

                    <DollarSign className="h-4 w-4 text-[#545f71]" />
                    <span>{formatCurrency(event.budget)} Budget</span>

                    <MapPin className="h-4 w-4 text-[#545f71]" />
                    <span className="truncate">{event.location_address}</span>
                  </div>
                </button>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12 bg-slate-50 rounded-lg">
            <Calendar className="h-12 w-12 mx-auto text-slate-400 mb-3" />
            <p className="text-slate-600 font-medium mb-1">No Active Events</p>
            <p className="text-sm text-slate-500">Create your first event to request quotes</p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3 pt-4">
          <Button
            variant="ghost"
            size="sm"
            className="flex-1 h-9 bg-[#232834] hover:bg-[#111827] text-white rounded-[15px] text-xs font-medium tracking-[-0.15px] leading-5 border border-transparent whitespace-nowrap"
            onClick={handleCreateNewEvent}
          >
            <Plus className="h-4 w-4 mr-1" />
            Create Event
          </Button>

          {events.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="flex-1 h-9 bg-[#232834] hover:bg-[#111827] text-white rounded-[15px] text-xs font-medium tracking-[-0.15px] leading-5 border border-transparent whitespace-nowrap disabled:opacity-50"
              onClick={handleSelectEvent}
              disabled={!selectedEventId}
            >
              Select Event
            </Button>
          )}
        </div>
      </div>
    </Modal>
  );
}
