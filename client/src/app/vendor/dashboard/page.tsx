'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { LeadCard } from '@/components/vendor/LeadCard';
import { Plus, Package, MessageSquare, TrendingUp, DollarSign } from 'lucide-react';
import { Lead } from '@/types';

// Mock data - will be replaced with actual data from Supabase
const mockLeads: Lead[] = [
  {
    id: '1',
    event_id: 'event-1',
    vendor_id: 'vendor-1',
    package_id: 'package-1',
    planner_id: 'planner-1',
    status: 'new',
    created_at: '2025-01-20T10:00:00Z',
    updated_at: '2025-01-20T10:00:00Z',
    event: {
      id: 'event-1',
      planner_id: 'planner-1',
      event_date: '2025-03-15',
      budget: 5000,
      guest_count: 150,
      location_address: '123 University Ave, Austin, TX',
      location_lat: 30.2672,
      location_lng: -97.7431,
      event_type: 'Spring Formal',
      description: 'Annual spring formal for fraternity',
      status: 'active',
      created_at: '2025-01-15T10:00:00Z',
      updated_at: '2025-01-15T10:00:00Z',
    },
  },
  {
    id: '2',
    event_id: 'event-2',
    vendor_id: 'vendor-1',
    package_id: 'package-1',
    planner_id: 'planner-2',
    status: 'quoted',
    created_at: '2025-01-18T14:00:00Z',
    responded_at: '2025-01-18T16:00:00Z',
    updated_at: '2025-01-18T16:00:00Z',
    event: {
      id: 'event-2',
      planner_id: 'planner-2',
      event_date: '2025-04-10',
      budget: 3500,
      guest_count: 100,
      location_address: '456 Campus Dr, Austin, TX',
      location_lat: 30.2849,
      location_lng: -97.7341,
      event_type: 'Networking Mixer',
      status: 'active',
      created_at: '2025-01-10T14:00:00Z',
      updated_at: '2025-01-10T14:00:00Z',
    },
  },
];

export default function VendorDashboard() {
  const newLeads = mockLeads.filter((l) => l.status === 'new').length;
  const quotedLeads = mockLeads.filter((l) => l.status === 'quoted').length;
  const bookedLeads = mockLeads.filter((l) => l.status === 'booked').length;

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Vendor Dashboard</h1>
            <p className="mt-2 text-slate-600">Manage your leads and packages</p>
          </div>
          <Button asChild>
            <Link href="/vendor/packages/create">
              <Plus className="mr-2 h-5 w-5" />
              Create Package
            </Link>
          </Button>
        </div>

        {/* Stats */}
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="rounded-lg bg-red-100 p-3">
                  <Package className="h-6 w-6 text-red-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-900">{newLeads}</p>
                  <p className="text-sm text-slate-600">New Leads</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="rounded-lg bg-yellow-100 p-3">
                  <MessageSquare className="h-6 w-6 text-yellow-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-900">{quotedLeads}</p>
                  <p className="text-sm text-slate-600">Quotes Sent</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="rounded-lg bg-green-100 p-3">
                  <TrendingUp className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-900">{bookedLeads}</p>
                  <p className="text-sm text-slate-600">Bookings</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="rounded-lg bg-primary-100 p-3">
                  <DollarSign className="h-6 w-6 text-primary-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-900">$0</p>
                  <p className="text-sm text-slate-600">Est. Revenue</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Leads List */}
        <div className="mt-8">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-xl font-semibold text-slate-900">Recent Leads</h2>
            <div className="flex gap-2">
              <Button variant="ghost" size="sm">
                All
              </Button>
              <Button variant="ghost" size="sm">
                New
              </Button>
              <Button variant="ghost" size="sm">
                Quoted
              </Button>
            </div>
          </div>

          {mockLeads.length > 0 ? (
            <div className="grid gap-6 lg:grid-cols-2">
              {mockLeads.map((lead) => (
                <LeadCard key={lead.id} lead={lead} />
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="p-12 text-center">
                <Package className="mx-auto h-12 w-12 text-slate-400" />
                <h3 className="mt-4 text-lg font-semibold text-slate-900">No leads yet</h3>
                <p className="mt-2 text-slate-600">
                  Create packages to start receiving leads from planners
                </p>
                <Button className="mt-6" asChild>
                  <Link href="/vendor/packages/create">
                    <Plus className="mr-2 h-5 w-5" />
                    Create Your First Package
                  </Link>
                </Button>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Quick Actions */}
        <div className="mt-8">
          <h2 className="mb-6 text-xl font-semibold text-slate-900">Quick Actions</h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <Card className="transition-all hover:shadow-md">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5 text-primary-600" />
                  My Packages
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-slate-600">
                  View and manage your event packages
                </p>
                <Button variant="outline" className="mt-4 w-full" asChild>
                  <Link href="/vendor/packages">View Packages</Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="transition-all hover:shadow-md">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5 text-secondary-600" />
                  Messages
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-slate-600">
                  Communicate with event planners
                </p>
                <Button variant="outline" className="mt-4 w-full" asChild>
                  <Link href="/messages">View Messages</Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="transition-all hover:shadow-md">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-accent-600" />
                  Analytics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-slate-600">
                  View your performance metrics
                </p>
                <Button variant="outline" className="mt-4 w-full" disabled>
                  Coming Soon
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
