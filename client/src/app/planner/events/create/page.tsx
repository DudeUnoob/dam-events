'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/Toast';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Textarea } from '@/components/ui/Textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
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

export default function CreateEventPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const returnTo = searchParams.get('returnTo');

  const [formData, setFormData] = useState({
    eventName: '',
    eventDate: '',
    budget: '',
    guestCount: '',
    locationAddress: '',
    eventType: 'social',
    description: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (!formData.eventName.trim()) {
      setError('Event name is required');
      return;
    }

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
      setLoading(true);

      const response = await fetch('/api/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          eventDate: formData.eventDate,
          budget: budget,
          guestCount: guestCount,
          locationAddress: formData.locationAddress.trim(),
          eventType: formData.eventType,
          description:
            formData.description.trim() || formData.eventName.trim() || undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok || data.error) {
        throw new Error(data.error?.message || 'Failed to create event');
      }

      showToast('Event created successfully!', 'success');

      // Redirect to returnTo URL with eventId if provided, otherwise go to event detail
      if (returnTo) {
        const separator = returnTo.includes('?') ? '&' : '?';
        router.push(`${returnTo}${separator}eventId=${data.data.id}`);
      } else {
        router.push(`/planner/events/${data.data.id}`);
      }
    } catch (err: any) {
      console.error('Error creating event:', err);
      setError(err.message || 'Failed to create event. Please try again.');
      showToast(err.message || 'Failed to create event', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8 flex justify-center">
        <div className="w-full max-w-2xl">
          {/* Back Button */}
          <Button variant="ghost" size="sm" className="mb-4" asChild>
            <Link href="/planner/dashboard">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Link>
          </Button>

          <Card variant="elevated" className="rounded-[25px] border border-[#232834] bg-[#f2f4f8]">
            <CardHeader className="text-center pt-6 pb-2 bg-[#f2f4f8] rounded-t-[25px]">
              <CardTitle className="text-2xl font-semibold text-black">
                Create New Event
              </CardTitle>
              <CardDescription className="mt-2 text-[12px] text-black">
                Create an event to attach vendor orders and quotes to. Fill in the details below.
              </CardDescription>
            </CardHeader>

            <CardContent className="bg-[#f2f4f8] rounded-b-[25px] pb-6">
              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Error Message */}
                {error && (
                  <div className="rounded-lg bg-red-50 border border-red-200 p-3 flex items-start gap-2">
                    <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-red-800">{error}</p>
                  </div>
                )}

                {/* Event Name */}
                <Input
                  type="text"
                  label="Event Name *"
                  name="eventName"
                  value={formData.eventName}
                  onChange={handleChange}
                  placeholder="e.g., Corporate Annual Gala"
                  required
                />

                {/* Date + Guests */}
                <div className="grid gap-4 md:grid-cols-2">
                  <Input
                    type="date"
                    label="Event Date *"
                    name="eventDate"
                    value={formData.eventDate}
                    onChange={handleChange}
                    required
                    min={new Date().toISOString().split('T')[0]}
                  />
                  <Input
                    type="number"
                    label="Number of Guests *"
                    name="guestCount"
                    value={formData.guestCount}
                    onChange={handleChange}
                    placeholder="e.g., 150"
                    min="1"
                    required
                  />
                </div>

                {/* Budget + Occasion */}
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <Input
                      type="number"
                      label="Budget *"
                      name="budget"
                      value={formData.budget}
                      onChange={handleChange}
                      placeholder="e.g., 25000"
                      min="0"
                      step="100"
                      required
                    />
                  </div>

                  <Select
                    label="Occasion *"
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
                </div>

                {/* Location */}
                <Input
                  type="text"
                  label="Event Location *"
                  name="locationAddress"
                  value={formData.locationAddress}
                  onChange={handleChange}
                  placeholder="e.g., Downtown Austin, Grand Ballroom"
                  required
                />

                {/* Additional Details */}
                <Textarea
                  label="Additional Details"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Add any special requirements, themes, dietary restrictions, or other important details..."
                  rows={3}
                  maxLength={500}
                />

                {/* Form Actions */}
                <div className="flex justify-end pt-4">
                  <Button
                    type="submit"
                    variant="ghost"
                    size="sm"
                    className="px-6 bg-[#232834] hover:bg-[#111827] text-white rounded-full text-xs font-medium tracking-[-0.15px] leading-5 border border-transparent whitespace-nowrap"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      'Create Event'
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
