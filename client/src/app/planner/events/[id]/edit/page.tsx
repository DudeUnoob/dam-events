'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/Toast';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Textarea } from '@/components/ui/Textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';
import { ErrorState } from '@/components/shared/ErrorState';
import { ArrowLeft, Calendar, Loader2, AlertCircle } from 'lucide-react';
import Link from 'next/link';

const EVENT_TYPES = [
  { value: 'social', label: 'Social Event' },
  { value: 'mixer', label: 'Mixer' },
  { value: 'formal', label: 'Formal' },
  { value: 'fundraiser', label: 'Fundraiser' },
  { value: 'conference', label: 'Conference' },
  { value: 'workshop', label: 'Workshop' },
  { value: 'other', label: 'Other' },
];

export default function EditEventPage() {
  const router = useRouter();
  const params = useParams();
  const { user } = useAuth();
  const { showToast } = useToast();
  const [loadingEvent, setLoadingEvent] = useState(true);
  const [savingEvent, setSavingEvent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const eventId = params.id as string;

  const [formData, setFormData] = useState({
    eventDate: '',
    budget: '',
    guestCount: '',
    locationAddress: '',
    eventType: 'social',
    description: '',
  });

  // Fetch event data
  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const response = await fetch(`/api/events/${eventId}`);
        const data = await response.json();

        if (!response.ok || data.error) {
          throw new Error(data.error?.message || 'Failed to load event');
        }

        const event = data.data;
        setFormData({
          eventDate: event.event_date ? new Date(event.event_date).toISOString().split('T')[0] : '',
          budget: event.budget?.toString() || '',
          guestCount: event.guest_count?.toString() || '',
          locationAddress: event.location_address || '',
          eventType: event.event_type || 'social',
          description: event.description || '',
        });
      } catch (err: any) {
        console.error('Error fetching event:', err);
        setFetchError(err.message || 'Failed to load event');
      } finally {
        setLoadingEvent(false);
      }
    };

    if (user && eventId) {
      fetchEvent();
    }
  }, [user, eventId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (!formData.eventDate) {
      setError('Event date is required');
      return;
    }

    const budget = parseFloat(formData.budget);
    if (isNaN(budget) || budget <= 0) {
      setError('Please enter a valid budget');
      return;
    }

    const guestCount = parseInt(formData.guestCount);
    if (isNaN(guestCount) || guestCount <= 0) {
      setError('Please enter a valid guest count');
      return;
    }

    if (!formData.locationAddress.trim()) {
      setError('Location is required');
      return;
    }

    try {
      setSavingEvent(true);

      const response = await fetch(`/api/events/${eventId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          eventDate: formData.eventDate,
          budget: budget,
          guestCount: guestCount,
          locationAddress: formData.locationAddress.trim(),
          eventType: formData.eventType,
          description: formData.description.trim() || undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok || data.error) {
        throw new Error(data.error?.message || 'Failed to update event');
      }

      showToast('Event updated successfully!', 'success');
      router.push(`/planner/events/${eventId}`);
    } catch (err: any) {
      console.error('Error updating event:', err);
      setError(err.message || 'Failed to update event. Please try again.');
      showToast(err.message || 'Failed to update event', 'error');
    } finally {
      setSavingEvent(false);
    }
  };

  if (loadingEvent) {
    return (
      <div className="min-h-screen bg-slate-50">
        <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
          <Skeleton className="h-96 w-full" />
        </div>
      </div>
    );
  }

  if (fetchError) {
    return (
      <div className="min-h-screen bg-slate-50">
        <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
          <ErrorState
            title="Failed to load event"
            message={fetchError}
            action={{
              label: 'Back to Dashboard',
              onClick: () => router.push('/planner/dashboard'),
            }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Back Button */}
        <Button variant="ghost" size="sm" className="mb-6" asChild>
          <Link href={`/planner/events/${eventId}`}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Event
          </Link>
        </Button>

        <Card variant="elevated">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-primary-100 p-3">
                <Calendar className="h-6 w-6 text-primary-600" />
              </div>
              <div>
                <CardTitle>Edit Event</CardTitle>
                <CardDescription>Update your event details</CardDescription>
              </div>
            </div>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Error Message */}
              {error && (
                <div className="rounded-lg bg-red-50 border border-red-200 p-3 flex items-start gap-2">
                  <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-red-800">{error}</p>
                </div>
              )}

              {/* Event Type */}
              <Select
                label="Event Type"
                name="eventType"
                value={formData.eventType}
                onChange={handleChange}
                required
              >
                {EVENT_TYPES.map(type => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </Select>

              {/* Event Date */}
              <Input
                type="date"
                label="Event Date"
                name="eventDate"
                value={formData.eventDate}
                onChange={handleChange}
                required
                min={new Date().toISOString().split('T')[0]}
              />

              {/* Guest Count */}
              <Input
                type="number"
                label="Expected Guest Count"
                name="guestCount"
                value={formData.guestCount}
                onChange={handleChange}
                placeholder="e.g., 150"
                min="1"
                required
              />

              {/* Budget */}
              <div>
                <Input
                  type="number"
                  label="Budget"
                  name="budget"
                  value={formData.budget}
                  onChange={handleChange}
                  placeholder="e.g., 5000"
                  min="0"
                  step="100"
                  required
                />
                <p className="mt-1 text-xs text-slate-500">
                  Enter your total budget in USD
                </p>
              </div>

              {/* Location */}
              <div>
                <Input
                  type="text"
                  label="Event Location"
                  name="locationAddress"
                  value={formData.locationAddress}
                  onChange={handleChange}
                  placeholder="Enter address or city"
                  required
                />
                <p className="mt-1 text-xs text-slate-500">
                  We&apos;ll use this to find nearby venues
                </p>
              </div>

              {/* Description */}
              <Textarea
                label="Event Description (Optional)"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Tell vendors more about your event..."
                rows={4}
                maxLength={500}
              />

              {/* Form Actions */}
              <div className="flex gap-4 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={() => router.push(`/planner/events/${eventId}`)}
                  disabled={savingEvent}
                >
                  Cancel
                </Button>
                <Button type="submit" className="flex-1" disabled={savingEvent}>
                  {savingEvent ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    'Save Changes'
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Warning about existing leads */}
        <div className="mt-6 rounded-lg bg-yellow-50 border border-yellow-200 p-4">
          <h3 className="font-medium text-yellow-900">Note about event changes</h3>
          <p className="mt-1 text-sm text-yellow-800">
            Changing event details may affect existing package recommendations and vendor quotes.
            Consider communicating changes directly with vendors you&apos;ve already contacted.
          </p>
        </div>
      </div>
    </div>
  );
}
