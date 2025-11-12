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
        <p className="text-sm text-slate-600">
          Choose an event to request a quote for, or create a new event.
        </p>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
          </div>
        ) : events.length > 0 ? (
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {events.map((event) => (
              <button
                key={event.id}
                onClick={() => setSelectedEventId(event.id)}
                className={`w-full text-left rounded-lg border-2 p-4 transition-all hover:border-primary-300 hover:bg-primary-50 ${
                  selectedEventId === event.id
                    ? 'border-primary-600 bg-primary-50'
                    : 'border-slate-200 bg-white'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold text-slate-900">{event.event_type}</h3>
                      <Badge variant="info">{event.status}</Badge>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <Calendar className="h-4 w-4" />
                        <span>{formatDate(event.event_date)}</span>
                      </div>

                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <Users className="h-4 w-4" />
                        <span>{event.guest_count} guests</span>
                      </div>

                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <DollarSign className="h-4 w-4" />
                        <span>{formatCurrency(event.budget)}</span>
                      </div>

                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <MapPin className="h-4 w-4" />
                        <span className="truncate">{event.location_address}</span>
                      </div>
                    </div>
                  </div>

                  {selectedEventId === event.id && (
                    <div className="ml-4 flex-shrink-0">
                      <div className="h-6 w-6 rounded-full bg-primary-600 flex items-center justify-center">
                        <svg
                          className="h-4 w-4 text-white"
                          fill="none"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    </div>
                  )}
                </div>
              </button>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-slate-50 rounded-lg">
            <Calendar className="h-12 w-12 mx-auto text-slate-400 mb-3" />
            <p className="text-slate-600 font-medium mb-1">No Active Events</p>
            <p className="text-sm text-slate-500">Create your first event to request quotes</p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3 pt-4 border-t border-slate-200">
          <Button
            variant="outline"
            className="flex-1"
            onClick={handleCreateNewEvent}
          >
            <Plus className="h-4 w-4 mr-2" />
            Create New Event
          </Button>

          {events.length > 0 && (
            <Button
              className="flex-1"
              onClick={handleSelectEvent}
              disabled={!selectedEventId}
            >
              Continue with Selected Event
            </Button>
          )}
        </div>
      </div>
    </Modal>
  );
}
