'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';

import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { EventCard } from '@/components/planner/EventCard';
import { CardSkeleton } from '@/components/ui/Skeleton';
import { ErrorState } from '@/components/shared/ErrorState';
import { Plus, Calendar, MessageSquare, Package } from 'lucide-react';
import { Event } from '@/types';

export default function PlannerDashboard() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState({
    quotesReceived: 0,
    unreadMessages: 0,
  });

  // Redirect if not planner
  useEffect(() => {
    if (!authLoading && (!user || user.role !== 'planner')) {
      router.push('/');
    }
  }, [user, authLoading, router]);

  // Fetch events
  useEffect(() => {
    if (!user) return;

    const fetchEvents = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch('/api/events');
        const data = await response.json();

        if (!response.ok || data.error) {
          throw new Error(data.error?.message || 'Failed to fetch events');
        }

        setEvents(data.data || []);
      } catch (err: any) {
        console.error('Error fetching events:', err);
        setError(err.message || 'Failed to load events');
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, [user]);

  // Fetch stats (leads and messages)
  useEffect(() => {
    if (!user) return;

    const fetchStats = async () => {
      try {
        // Fetch leads for quote count
        const leadsResponse = await fetch('/api/leads?role=planner');
        const leadsData = await leadsResponse.json();

        if (leadsResponse.ok && leadsData.data) {
          setStats(prev => ({ ...prev, quotesReceived: leadsData.data.length }));
        }

        // TODO: Fetch unread message count when messages API is ready
      } catch (err) {
        console.error('Error fetching stats:', err);
      }
    };

    fetchStats();
  }, [user]);

  if (authLoading || (loading && events.length === 0)) {
    return (
      <div className="min-h-screen bg-slate-50">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="mb-8">
            <div className="h-8 w-48 bg-slate-200 rounded animate-pulse mb-2" />
            <div className="h-4 w-64 bg-slate-200 rounded animate-pulse" />
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
            {[1, 2, 3, 4].map(i => (
              <CardSkeleton key={i} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!user || user.role !== 'planner') {
    return null;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Card className="max-w-md">
          <ErrorState
            title="Failed to Load Dashboard"
            message={error}
            onRetry={() => window.location.reload()}
          />
        </Card>
      </div>
    );
  }
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
                    {events.filter((e) => e.status === 'active').length}
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
                  <p className="text-2xl font-bold text-slate-900">{stats.quotesReceived}</p>
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
                  <p className="text-2xl font-bold text-slate-900">{stats.unreadMessages}</p>
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
                    {events.filter((e) => e.status === 'booked').length}
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

          {events.length > 0 ? (
            <div className="grid gap-6 lg:grid-cols-2">
              {events.map((event) => (
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
