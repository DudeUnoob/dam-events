'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { ArrowLeft, Package, Upload } from 'lucide-react';
import Link from 'next/link';

export default function CreatePackagePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    // TODO: Implement package creation with Supabase
    setTimeout(() => {
      setLoading(false);
      router.push('/vendor/packages');
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Back Button */}
        <Button variant="ghost" size="sm" className="mb-6" asChild>
          <Link href="/vendor/dashboard">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Link>
        </Button>

        <Card variant="elevated">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-primary-100 p-3">
                <Package className="h-6 w-6 text-primary-600" />
              </div>
              <div>
                <CardTitle>Create Event Package</CardTitle>
                <CardDescription>
                  Bundle your venue, catering, and entertainment into one package
                </CardDescription>
              </div>
            </div>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Basic Information */}
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-slate-900">Basic Information</h3>

                <Input
                  type="text"
                  label="Package Name"
                  placeholder="e.g., Premium Social Package"
                  required
                />

                <Textarea
                  label="Package Description"
                  placeholder="Describe what makes this package special..."
                  rows={4}
                  required
                />

                <div className="grid gap-6 sm:grid-cols-2">
                  <Input
                    type="number"
                    label="Minimum Price ($)"
                    placeholder="4000"
                    min="0"
                    step="100"
                    required
                  />

                  <Input
                    type="number"
                    label="Maximum Price ($)"
                    placeholder="6000"
                    min="0"
                    step="100"
                    required
                  />
                </div>

                <Input
                  type="number"
                  label="Maximum Capacity"
                  placeholder="200"
                  min="1"
                  required
                />
              </div>

              {/* Venue Details */}
              <div className="space-y-6 border-t border-slate-200 pt-6">
                <h3 className="text-lg font-semibold text-slate-900">Venue Details</h3>

                <Input
                  type="text"
                  label="Venue Name"
                  placeholder="Grand Ballroom"
                  required
                />

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Amenities
                  </label>
                  <div className="space-y-2">
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        className="h-4 w-4 rounded border-slate-300 text-primary-600 focus:ring-primary-500"
                      />
                      <span className="text-sm text-slate-700">Stage</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        className="h-4 w-4 rounded border-slate-300 text-primary-600 focus:ring-primary-500"
                      />
                      <span className="text-sm text-slate-700">Dance Floor</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        className="h-4 w-4 rounded border-slate-300 text-primary-600 focus:ring-primary-500"
                      />
                      <span className="text-sm text-slate-700">Audio System</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        className="h-4 w-4 rounded border-slate-300 text-primary-600 focus:ring-primary-500"
                      />
                      <span className="text-sm text-slate-700">Parking</span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Catering Details */}
              <div className="space-y-6 border-t border-slate-200 pt-6">
                <h3 className="text-lg font-semibold text-slate-900">Catering Details</h3>

                <Textarea
                  label="Menu Options"
                  placeholder="Describe available menu options (e.g., Buffet, Plated Dinner, Appetizers)"
                  rows={3}
                />

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Dietary Accommodations
                  </label>
                  <div className="space-y-2">
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        className="h-4 w-4 rounded border-slate-300 text-primary-600 focus:ring-primary-500"
                      />
                      <span className="text-sm text-slate-700">Vegetarian</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        className="h-4 w-4 rounded border-slate-300 text-primary-600 focus:ring-primary-500"
                      />
                      <span className="text-sm text-slate-700">Vegan</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        className="h-4 w-4 rounded border-slate-300 text-primary-600 focus:ring-primary-500"
                      />
                      <span className="text-sm text-slate-700">Gluten-Free</span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Entertainment Details */}
              <div className="space-y-6 border-t border-slate-200 pt-6">
                <h3 className="text-lg font-semibold text-slate-900">
                  Entertainment Details (Optional)
                </h3>

                <Input
                  type="text"
                  label="Entertainment Type"
                  placeholder="e.g., DJ, Live Band, None"
                />

                <Textarea
                  label="Equipment Provided"
                  placeholder="List any entertainment equipment included (e.g., Sound System, Lighting, Microphones)"
                  rows={3}
                />
              </div>

              {/* Photos */}
              <div className="space-y-6 border-t border-slate-200 pt-6">
                <div>
                  <h3 className="text-lg font-semibold text-slate-900">Package Photos</h3>
                  <p className="mt-1 text-sm text-slate-600">
                    Upload photos of your venue and setup (up to 15 images)
                  </p>
                </div>

                <div className="flex items-center justify-center rounded-lg border-2 border-dashed border-slate-300 p-12 transition-colors hover:border-primary-400">
                  <div className="text-center">
                    <Upload className="mx-auto h-12 w-12 text-slate-400" />
                    <p className="mt-2 text-sm font-medium text-slate-900">
                      Drop images here or click to upload
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      PNG, JPG up to 5MB each
                    </p>
                    <Button variant="outline" size="sm" className="mt-4" type="button">
                      Choose Files
                    </Button>
                  </div>
                </div>
              </div>

              {/* Form Actions */}
              <div className="flex gap-4 border-t border-slate-200 pt-6">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={() => router.push('/vendor/dashboard')}
                >
                  Save as Draft
                </Button>
                <Button type="submit" className="flex-1" disabled={loading}>
                  {loading ? 'Publishing...' : 'Publish Package'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
