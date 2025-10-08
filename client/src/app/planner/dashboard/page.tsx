'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { EventCard } from '@/components/planner/EventCard';
import { Plus, Calendar, MessageSquare, Package } from 'lucide-react';
import { Event } from '@/types';

// Mock data - will be replaced with actual data from Supabase
const mockEvents: Event[] = [
  {
    id: '1',
    planner_id: 'user-1',
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
  {
    id: '2',
    planner_id: 'user-1',
    event_date: '2025-04-20',
    budget: 3000,
    guest_count: 80,
    location_address: '456 Campus Dr, Austin, TX',
    location_lat: 30.2849,
    location_lng: -97.7341,
    event_type: 'Networking Mixer',
    description: 'Professional networking event',
    status: 'draft',
    created_at: '2025-01-10T14:00:00Z',
    updated_at: '2025-01-10T14:00:00Z',
  },
];

export default function PlannerDashboard() {
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">My Events</h1>
            <p className="mt-2 text-slate-600">Manage and track your upcoming events</p>
          </div>
          <Button asChild>
            <Link href="/planner/events/create">
              <Plus className="mr-2 h-5 w-5" />
              Create Event
            </Link>
          </Button>
        </div>

        {/* Stats */}
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="rounded-lg bg-primary-100 p-3">
                  <Calendar className="h-6 w-6 text-primary-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-900">
                    {mockEvents.filter((e) => e.status === 'active').length}
                  </p>
                  <p className="text-sm text-slate-600">Active Events</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="rounded-lg bg-secondary-100 p-3">
                  <Package className="h-6 w-6 text-secondary-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-900">0</p>
                  <p className="text-sm text-slate-600">Quotes Received</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="rounded-lg bg-accent-100 p-3">
                  <MessageSquare className="h-6 w-6 text-accent-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-900">0</p>
                  <p className="text-sm text-slate-600">Unread Messages</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="rounded-lg bg-green-100 p-3">
                  <Calendar className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-900">
                    {mockEvents.filter((e) => e.status === 'booked').length}
                  </p>
                  <p className="text-sm text-slate-600">Booked Events</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Events List */}
        <div className="mt-8">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-xl font-semibold text-slate-900">Recent Events</h2>
            <div className="flex gap-2">
              <Button variant="ghost" size="sm">
                All
              </Button>
              <Button variant="ghost" size="sm">
                Active
              </Button>
              <Button variant="ghost" size="sm">
                Draft
              </Button>
            </div>
          </div>

          {mockEvents.length > 0 ? (
            <div className="grid gap-6 lg:grid-cols-2">
              {mockEvents.map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="p-12 text-center">
                <Calendar className="mx-auto h-12 w-12 text-slate-400" />
                <h3 className="mt-4 text-lg font-semibold text-slate-900">No events yet</h3>
                <p className="mt-2 text-slate-600">
                  Create your first event to start finding vendors
                </p>
                <Button className="mt-6" asChild>
                  <Link href="/planner/events/create">
                    <Plus className="mr-2 h-5 w-5" />
                    Create Your First Event
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
                  Browse Packages
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-slate-600">
                  Explore complete event packages from verified vendors
                </p>
                <Button variant="outline" className="mt-4 w-full" asChild>
                  <Link href="/planner/browse">Browse Now</Link>
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
                  View and respond to messages from vendors
                </p>
                <Button variant="outline" className="mt-4 w-full" asChild>
                  <Link href="/messages">View Messages</Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="transition-all hover:shadow-md">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-accent-600" />
                  Event Calendar
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-slate-600">
                  See all your events in a calendar view
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
