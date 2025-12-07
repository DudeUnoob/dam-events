'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';

import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { ErrorState } from '@/components/shared/ErrorState';
import { Plus, Calendar, MapPin, Users, DollarSign, LogOut } from 'lucide-react';
import { Event, Lead } from '@/types';

type DashboardTab = 'events' | 'bookings' | 'saved_vendors' | 'budget';

function EventSummaryCard({ event }: { event: Event }) {
  const eventDate = event.event_date
    ? new Date(event.event_date).toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      })
    : 'TBD';

  const isActive = event.status === 'active';

  return (
    <Card className="border border-[#545f71]/30 rounded-2xl shadow-[0px_1px_3px_rgba(0,0,0,0.1),0px_1px_2px_rgba(0,0,0,0.05)] overflow-hidden bg-[#d8dfe9]">
      <div className="bg-[#f2f4f8] px-4 py-3 flex items-center justify-between">
        <div className="text-sm font-medium text-slate-900 truncate">Event Name</div>
        <div className="flex items-center gap-3">
          {isActive && (
            <span className="inline-flex items-center rounded-full bg-[#bfeab4] px-2 py-0.5 text-xs font-medium text-slate-800">
              Active
            </span>
          )}
          <Button
            asChild
            size="sm"
            variant="outline"
            className="h-8 rounded-full border-[#545f71] text-xs px-3 bg-white"
          >
            <Link href={`/planner/events/${event.id}`}>View Details</Link>
          </Button>
        </div>
      </div>

      <CardContent className="bg-[#d8dfe9] pt-3 pb-4 px-4 space-y-2 text-xs text-slate-900">
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-[#545f71]" />
          <span>{eventDate}</span>
        </div>
        <div className="flex items-center gap-2">
          <Users className="h-4 w-4 text-[#545f71]" />
          <span>{event.guest_count || 0} Guests</span>
        </div>
        <div className="flex items-center gap-2">
          <DollarSign className="h-4 w-4 text-[#545f71]" />
          <span>
            {event.budget ? `$${event.budget.toLocaleString()}` : '$0'} Budget
          </span>
        </div>
        <div className="flex items-center gap-2">
          <MapPin className="h-4 w-4 text-[#545f71]" />
          <span className="truncate">{event.location_address}</span>
        </div>
      </CardContent>
    </Card>
  );
}

function getQuoteStatusBuckets(leads: Lead[]) {
  const total = leads.length;
  const accepted = leads.filter(l => l.status === 'booked').length;
  const pending = leads.filter(l =>
    ['new', 'viewed', 'quoted'].includes(l.status)
  ).length;
  const declined = leads.filter(l =>
    ['declined', 'closed'].includes(l.status)
  ).length;

  return { total, accepted, pending, declined };
}

function QuoteCard({ lead }: { lead: Lead }) {
  const pkg = lead.package || lead.packages;
  const vendor = lead.vendor || lead.vendors;
  const event = lead.event || lead.events;

  const serviceType = pkg?.venue_details
    ? 'Venue'
    : pkg?.catering_details
    ? 'Catering'
    : pkg?.entertainment_details
    ? 'Entertainment'
    : pkg?.rental_details
    ? 'Rentals'
    : 'Service';

  const statusLabel =
    lead.status === 'booked'
      ? 'Accepted'
      : lead.status === 'declined'
      ? 'Declined'
      : 'Pending';

  const statusColor =
    statusLabel === 'Accepted'
      ? 'bg-[#bfeab4] text-[#1f4b26]'
      : statusLabel === 'Declined'
      ? 'bg-[#fddede] text-[#7c1f1f]'
      : 'bg-[#ffeab5] text-[#7a5b13]';

  return (
    <Card className="border border-[#545f71]/30 rounded-2xl bg-[#d8dfe9] shadow-[0px_1px_3px_rgba(0,0,0,0.1),0px_1px_2px_rgba(0,0,0,0.05)] w-full">
      <div className="px-4 pt-3 pb-1 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <p className="text-sm font-medium text-slate-900">
            {vendor?.business_name || 'Vendor Name'}
          </p>
          <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium ${statusColor}`}>
            {statusLabel}
          </span>
        </div>
        <Button
          asChild
          size="sm"
          variant="outline"
          className="h-7 rounded-full border-[#545f71] text-[11px] px-3 bg-white"
        >
          <Link href={`/planner/leads/${lead.id}`}>View Details</Link>
        </Button>
      </div>
      <CardContent className="px-4 pb-4 pt-2 text-xs text-slate-900 space-y-1.5">
        <p className="text-[11px] text-slate-600">
          Requested {new Date(lead.created_at).toLocaleDateString()}
        </p>
        <p>
          <span className="font-medium">Service:</span>{' '}
          {serviceType}
        </p>
        <p>
          <span className="font-medium">Event:</span>{' '}
          {event?.event_type || 'Event'}
        </p>
      </CardContent>
    </Card>
  );
}

export default function PlannerDashboard() {
  const { user, loading: authLoading, signOut } = useAuth();
  const router = useRouter();
  const [events, setEvents] = useState<Event[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<DashboardTab>('events');

  // Redirect if not planner
  useEffect(() => {
    if (!authLoading && (!user || user.role !== 'planner')) {
      router.push('/');
    }
  }, [user, authLoading, router]);

  // Fetch events & quotes
  useEffect(() => {
    if (!user) return;

    const fetchEventsAndLeads = async () => {
      try {
        setLoading(true);
        setError(null);

        const [eventsRes, leadsRes] = await Promise.all([
          fetch('/api/events'),
          fetch('/api/leads?role=planner'),
        ]);

        const eventsData = await eventsRes.json();
        const leadsData = await leadsRes.json();

        if (!eventsRes.ok || eventsData.error) {
          throw new Error(eventsData.error?.message || 'Failed to fetch events');
        }

        setEvents(eventsData.data || []);

        if (leadsRes.ok && leadsData.data) {
          setLeads(leadsData.data || []);
        }
      } catch (err: any) {
        console.error('Error fetching dashboard data:', err);
        setError(err.message || 'Failed to load dashboard');
      } finally {
        setLoading(false);
      }
    };

    fetchEventsAndLeads();
  }, [user]);

  if (authLoading || (loading && events.length === 0)) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-48 bg-slate-200 rounded animate-pulse mb-4 mx-auto" />
          <p className="text-slate-600">Loading your account...</p>
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
            title="Failed to Load Account"
            message={error}
            onRetry={() => window.location.reload()}
          />
        </Card>
      </div>
    );
  }

  const currentEvents = events.filter(
    e => e.status === 'active' || e.status === 'booked'
  );
  const pastEvents = events.filter(
    e => e.status === 'closed' || e.status === 'draft'
  );

  const quoteStats = getQuoteStatusBuckets(leads);
  const acceptedLeads = leads.filter(l => l.status === 'booked');
  const pendingLeads = leads.filter(l =>
    ['new', 'viewed', 'quoted'].includes(l.status)
  );

  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* My Account header pill */}
        <div className="mb-10">
          <div className="bg-[#232834] text-white rounded-[25px] px-10 py-5 flex items-center">
            <h1 className="text-2xl font-semibold tracking-[0.08em]">My Account</h1>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[402px,minmax(0,1fr)] gap-8">
          {/* Left profile column */}
          <Card className="rounded-[25px] shadow-[0px_4px_8px_rgba(0,0,0,0.25)]">
            <CardContent className="p-8 flex flex-col h-full">
              <div className="flex flex-col items-center text-center mb-6 mt-4">
                <div className="w-32 h-32 rounded-full bg-[#E5F0FF] flex items-center justify-center mb-4">
                  <span className="text-4xl font-semibold text-[#5F8DFF]">
                    {user.full_name ? user.full_name[0].toUpperCase() : 'S'}
                  </span>
                </div>
                <h2 className="text-lg font-medium text-slate-900">{user.full_name}</h2>
                <p className="text-xs text-slate-600 mt-1">{user.email}</p>
                <Button
                  size="sm"
                  className="mt-4 rounded-full bg-[#232834] text-white px-6"
                  onClick={() => router.push('/planner/profile')}
                >
                  Edit Profile
                </Button>
              </div>

              <div className="border-t border-slate-200 pt-6 mt-2 space-y-4 text-xs text-slate-900">
                <div className="flex justify-between">
                  <div>
                    <p className="font-semibold">Name</p>
                    <p>{user.full_name}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">Phone Number</p>
                    <p>{user.phone || '*** - 123 - 4567'}</p>
                  </div>
                </div>
                <div className="flex justify-between">
                  <div>
                    <p className="font-semibold">Email</p>
                    <p>{user.email}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">Location</p>
                    <p>Austin, TX</p>
                  </div>
                </div>
              </div>

              <div className="mt-6 space-y-3">
                <button className="w-full rounded-[25px] bg-[#f2f4f8] py-3 text-sm text-slate-900">
                  Payment methods
                </button>
                <button className="w-full rounded-[25px] bg-[#f2f4f8] py-3 text-sm text-slate-900">
                  Reviews
                </button>
                <button className="w-full rounded-[25px] bg-[#f2f4f8] py-3 text-sm text-slate-900">
                  Security and Settings
                </button>
                <button className="w-full rounded-[25px] bg-[#f2f4f8] py-3 text-sm text-slate-900">
                  Help
                </button>
              </div>

              <button
                className="mt-auto pt-6 flex items-center justify-center gap-2 text-sm text-[#545f71]"
                onClick={() => signOut()}
              >
                <LogOut className="h-4 w-4" />
                <span>Sign out</span>
              </button>
            </CardContent>
          </Card>

          {/* Right content column */}
          <div className="space-y-8">
            {/* Tabs + Create Event */}
            <div className="flex flex-col gap-4">
              <div className="flex flex-wrap gap-4">
                <button
                  className={`h-[66px] px-10 rounded-[25px] text-base font-normal ${
                    activeTab === 'events'
                      ? 'bg-[#232834] text-white'
                      : 'bg-[#f2f4f8] text-slate-900'
                  }`}
                  onClick={() => setActiveTab('events')}
                >
                  Events
                </button>
                <button
                  className={`h-[66px] px-10 rounded-[25px] text-base ${
                    activeTab === 'bookings'
                      ? 'bg-[#232834] text-white'
                      : 'bg-[#f2f4f8] text-slate-900'
                  }`}
                  onClick={() => setActiveTab('bookings')}
                >
                  Bookings
                </button>
                <button className="h-[66px] px-10 rounded-[25px] bg-[#f2f4f8] text-base text-slate-900">
                  Saved Vendors
                </button>
                <button className="h-[66px] px-10 rounded-[25px] bg-[#f2f4f8] text-base text-slate-900">
                  Budget
                </button>
              </div>
              <div className="flex justify-end">
                <Button
                  asChild
                  className="h-[41px] rounded-[15px] bg-[#232834] text-white px-5 flex items-center gap-2"
                >
                  <Link href="/planner/events/create">
                    <Plus className="h-4 w-4" />
                    Create Event
                  </Link>
                </Button>
              </div>
            </div>

            {/* Right pane content */}
            {activeTab === 'events' && (
              <div className="space-y-6">
                <h2 className="text-2xl font-semibold text-slate-900">My Events</h2>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-medium text-slate-900">Current Events</h3>
                  </div>
                  {currentEvents.length > 0 ? (
                    <div className="grid gap-5 md:grid-cols-2">
                      {currentEvents.map(event => (
                        <EventSummaryCard key={event.id} event={event} />
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-slate-500">
                      You don&apos;t have any current events yet.
                    </p>
                  )}
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-slate-900">Past Events</h3>
                  {pastEvents.length > 0 ? (
                    <div className="grid gap-5 md:grid-cols-2">
                      {pastEvents.map(event => (
                        <EventSummaryCard key={event.id} event={event} />
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-slate-500">No past events yet.</p>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'bookings' && (
              <div className="space-y-8">
                <h2 className="text-2xl font-semibold text-slate-900">My Quotes</h2>

                {/* Summary pill */}
                <Card className="rounded-2xl border border-[#d8dfe9]">
                  <CardContent className="px-10 py-0">
                    <div className="flex h-[80px] items-center justify-between text-sm text-slate-900">
                      <div className="font-semibold text-base text-slate-900">
                        Total Quotes
                      </div>
                      <div className="flex flex-1 justify-end gap-12">
                        <div className="text-center">
                          <div className="text-xs text-slate-600 mb-1">Total</div>
                          <div className="text-base font-semibold text-slate-900">
                            {quoteStats.total}
                          </div>
                        </div>
                        <div className="text-center">
                          <div className="text-xs text-slate-600 mb-1">Accepted</div>
                          <div className="text-base font-semibold text-green-600">
                            {quoteStats.accepted}
                          </div>
                        </div>
                        <div className="text-center">
                          <div className="text-xs text-slate-600 mb-1">Pending</div>
                          <div className="text-base font-semibold text-[#e0a800]">
                            {quoteStats.pending}
                          </div>
                        </div>
                        <div className="text-center">
                          <div className="text-xs text-slate-600 mb-1">Declined</div>
                          <div className="text-base font-semibold text-red-600">
                            {quoteStats.declined}
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Accepted Quotes */}
                <div className="space-y-4 mt-4">
                  <h3 className="text-lg font-medium text-slate-900">Accepted Quotes</h3>
                  {acceptedLeads.length > 0 ? (
                    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                      {acceptedLeads.map(lead => (
                        <QuoteCard key={lead.id} lead={lead} />
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-slate-500">
                      You don&apos;t have any accepted quotes yet.
                    </p>
                  )}
                </div>

                {/* Pending Quotes */}
                <div className="space-y-4 mt-6">
                  <h3 className="text-lg font-medium text-slate-900">Pending Quotes</h3>
                  {pendingLeads.length > 0 ? (
                    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                      {pendingLeads.map(lead => (
                        <QuoteCard key={lead.id} lead={lead} />
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-slate-500">
                      You don&apos;t have any pending quotes right now.
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

