'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Textarea } from '@/components/ui/Textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { ArrowLeft, Calendar } from 'lucide-react';
import Link from 'next/link';

export default function CreateEventPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    // TODO: Implement event creation with Supabase
    setTimeout(() => {
      setLoading(false);
      router.push('/planner/dashboard');
    }, 1000);
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
              {/* Event Type */}
              <Select label="Event Type" required>
                <option value="">Select event type</option>
                <option value="social">Social</option>
                <option value="mixer">Mixer</option>
                <option value="formal">Formal</option>
                <option value="fundraiser">Fundraiser</option>
                <option value="conference">Conference</option>
                <option value="other">Other</option>
              </Select>

              {/* Event Date */}
              <Input
                type="date"
                label="Event Date"
                required
                min={new Date().toISOString().split('T')[0]}
              />

              {/* Guest Count */}
              <Input
                type="number"
                label="Expected Guest Count"
                placeholder="e.g., 150"
                min="1"
                required
              />

              {/* Budget */}
              <div>
                <Input
                  type="number"
                  label="Budget"
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
                placeholder="Tell vendors more about your event..."
                rows={4}
              />

              {/* Form Actions */}
              <div className="flex gap-4 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={() => router.push('/planner/dashboard')}
                >
                  Save as Draft
                </Button>
                <Button type="submit" className="flex-1" disabled={loading}>
                  {loading ? 'Creating...' : 'Create & Find Packages'}
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
