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
          description: formData.description.trim() || undefined,
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
      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Back Button */}
        <Button variant="ghost" size="sm" className="mb-6" asChild>
          <Link href="/planner/dashboard">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Link>
        </Button>

        <Card variant="elevated">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-primary-100 p-3">
                <Calendar className="h-6 w-6 text-primary-600" />
              </div>
              <div>
                <CardTitle>Create New Event</CardTitle>
                <CardDescription>Tell us about your event to find matching packages</CardDescription>
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
                  onClick={() => router.push('/planner/dashboard')}
                  disabled={loading}
                >
                  Cancel
                </Button>
                <Button type="submit" className="flex-1" disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    'Create & Find Packages'
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Help Text */}
        <div className="mt-6 rounded-lg bg-blue-50 p-4">
          <h3 className="font-medium text-blue-900">What happens next?</h3>
          <ul className="mt-2 space-y-1 text-sm text-blue-800">
            <li>• We&apos;ll show you packages that match your requirements</li>
            <li>• You can request quotes from multiple vendors at once</li>
            <li>• Vendors typically respond within 24-48 hours</li>
            <li>• All communication happens in your dashboard</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
