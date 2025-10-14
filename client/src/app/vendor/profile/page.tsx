'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Building2, MapPin, Phone, Mail, CheckCircle } from 'lucide-react';

export default function VendorProfilePage() {
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    // TODO: Implement profile update with Supabase
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold text-slate-900">Business Profile</h1>
            <Badge variant="success" className="flex items-center gap-1">
              <CheckCircle className="h-3 w-3" />
              Verified
            </Badge>
          </div>
          <p className="mt-2 text-slate-600">
            Manage your business information and services
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Profile Form */}
          <Card variant="elevated" className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Business Information</CardTitle>
              <CardDescription>
                This information will be visible to event planners
              </CardDescription>
            </CardHeader>

            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Business Name */}
                <Input
                  type="text"
                  label="Business Name"
                  placeholder="Elite Events Venue"
                  defaultValue="Elite Events Venue"
                  required
                />

                {/* Phone */}
                <div>
                  <Input
                    type="tel"
                    label="Phone Number"
                    placeholder="(512) 555-0100"
                    defaultValue="(512) 555-0100"
                    required
                  />
                  <p className="mt-1 text-xs text-slate-500">
                    Used for lead notifications via SMS
                  </p>
                </div>

                {/* Email */}
                <div>
                  <Input
                    type="email"
                    label="Email"
                    defaultValue="contact@eliteevents.com"
                    disabled
                  />
                  <p className="mt-1 text-xs text-slate-500">
                    Email cannot be changed. Contact support if needed.
                  </p>
                </div>

                {/* Location */}
                <div>
                  <Input
                    type="text"
                    label="Business Address"
                    placeholder="123 Main St, Austin, TX 78701"
                    defaultValue="123 Main St, Austin, TX 78701"
                    required
                  />
                  <p className="mt-1 text-xs text-slate-500">
                    We use this to calculate distance for planners
                  </p>
                </div>

                {/* Description */}
                <Textarea
                  label="Business Description"
                  placeholder="Tell planners about your venue and services..."
                  defaultValue="Premium event space in downtown Austin with full catering and entertainment services."
                  rows={4}
                  required
                />

                {/* Services */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Services Offered
                  </label>
                  <div className="space-y-2">
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        defaultChecked
                        className="h-4 w-4 rounded border-slate-300 text-primary-600 focus:ring-primary-500"
                      />
                      <span className="text-sm text-slate-700">Venue</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        defaultChecked
                        className="h-4 w-4 rounded border-slate-300 text-primary-600 focus:ring-primary-500"
                      />
                      <span className="text-sm text-slate-700">Catering</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        defaultChecked
                        className="h-4 w-4 rounded border-slate-300 text-primary-600 focus:ring-primary-500"
                      />
                      <span className="text-sm text-slate-700">Entertainment</span>
                    </label>
                  </div>
                </div>

                {/* Form Actions */}
                <div className="flex gap-4 pt-4">
                  <Button type="submit" disabled={loading}>
                    {loading ? 'Saving...' : 'Save Changes'}
                  </Button>
                  <Button type="button" variant="outline">
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Profile Summary */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="rounded-lg bg-primary-100 p-3">
                    <Building2 className="h-6 w-6 text-primary-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900">Elite Events</h3>
                    <Badge variant="success" className="mt-1">Verified</Badge>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-start gap-2 text-sm text-slate-600">
                    <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0" />
                    <span>Austin, TX</span>
                  </div>
                  <div className="flex items-start gap-2 text-sm text-slate-600">
                    <Phone className="h-4 w-4 mt-0.5 flex-shrink-0" />
                    <span>(512) 555-0100</span>
                  </div>
                  <div className="flex items-start gap-2 text-sm text-slate-600">
                    <Mail className="h-4 w-4 mt-0.5 flex-shrink-0" />
                    <span>contact@eliteevents.com</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Profile Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Packages</span>
                  <span className="font-semibold text-slate-900">2</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Total Leads</span>
                  <span className="font-semibold text-slate-900">15</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Bookings</span>
                  <span className="font-semibold text-slate-900">3</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Response Rate</span>
                  <span className="font-semibold text-green-600">95%</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
