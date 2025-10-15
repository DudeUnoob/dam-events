'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/Toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { CardSkeleton } from '@/components/ui/Skeleton';
import { ErrorState } from '@/components/shared/ErrorState';
import {
  Calendar,
  Users,
  DollarSign,
  MapPin,
  Edit,
  Package,
  ArrowLeft,
  FileText,
} from 'lucide-react';
import { Event, Lead } from '@/types';
import { formatCurrency, formatDate } from '@/lib/utils';
import Link from 'next/link';

export default function EventDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { showToast } = useToast();
  const [event, setEvent] = useState<Event | null>(null);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const eventId = params.id as string;

  useEffect(() => {
    if (!user || !eventId) return;

    const fetchEventData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch event details
        const eventResponse = await fetch(`/api/events/${eventId}`);
        const eventData = await eventResponse.json();

        if (!eventResponse.ok || eventData.error) {
          throw new Error(eventData.error?.message || 'Event not found');
        }

        setEvent(eventData.data);

        // Fetch leads for this event
        try {
          const leadsResponse = await fetch('/api/leads?role=planner');
          const leadsData = await leadsResponse.json();

          if (leadsResponse.ok && leadsData.data) {
            const eventLeads = leadsData.data.filter((lead: Lead) => lead.event_id === eventId);
            setLeads(eventLeads);
          }
        } catch (err) {
          console.error('Error fetching leads:', err);
        }
      } catch (err: any) {
        console.error('Error fetching event:', err);
        setError(err.message || 'Failed to load event');
      } finally {
        setLoading(false);
      }
    };

    fetchEventData();
  }, [user, eventId]);

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-slate-50 py-8">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <CardSkeleton />
        </div>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Card className="max-w-md">
          <ErrorState
            title="Event Not Found"
            message={error || 'This event does not exist or you do not have access to it'}
            onRetry={() => router.push('/planner/dashboard')}
            showRetry={false}
          />
        </Card>
      </div>
    );
  }

  const statusColors = {
    draft: 'default' as const,
    active: 'info' as const,
    booked: 'success' as const,
    closed: 'default' as const,
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <Button variant="ghost" size="sm" className="mb-6" asChild>
          <Link href="/planner/dashboard">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Link>
        </Button>

        {/* Header */}
        <div className="mb-6 flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold text-slate-900">{event.event_type}</h1>
              <Badge variant={statusColors[event.status]}>{event.status}</Badge>
            </div>
            <p className="text-slate-600">Created on {formatDate(event.created_at)}</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </Button>
            <Button size="sm" asChild>
              <Link href={`/planner/browse?eventId=${event.id}`}>
                <Package className="mr-2 h-4 w-4" />
                Find Packages
              </Link>
            </Button>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Event Details */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Event Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="flex items-start gap-3">
                    <div className="rounded-lg bg-primary-100 p-2">
                      <Calendar className="h-5 w-5 text-primary-600" />
                    </div>
                    <div>
                      <p className="text-sm text-slate-600">Event Date</p>
                      <p className="font-medium text-slate-900">{formatDate(event.event_date)}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="rounded-lg bg-secondary-100 p-2">
                      <Users className="h-5 w-5 text-secondary-600" />
                    </div>
                    <div>
                      <p className="text-sm text-slate-600">Guest Count</p>
                      <p className="font-medium text-slate-900">{event.guest_count} guests</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="rounded-lg bg-accent-100 p-2">
                      <DollarSign className="h-5 w-5 text-accent-600" />
                    </div>
                    <div>
                      <p className="text-sm text-slate-600">Budget</p>
                      <p className="font-medium text-slate-900">{formatCurrency(event.budget)}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="rounded-lg bg-green-100 p-2">
                      <MapPin className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm text-slate-600">Location</p>
                      <p className="font-medium text-slate-900">{event.location_address}</p>
                    </div>
                  </div>
                </div>

                {event.description && (
                  <div className="pt-4 border-t">
                    <div className="flex items-center gap-2 mb-2">
                      <FileText className="h-4 w-4 text-slate-600" />
                      <p className="text-sm font-medium text-slate-600">Description</p>
                    </div>
                    <p className="text-slate-700">{event.description}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Leads/Quotes */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Quotes Requested ({leads.length})</CardTitle>
                  {leads.length === 0 && (
                    <Button size="sm" asChild>
                      <Link href={`/planner/browse?eventId=${event.id}`}>
                        Request Quotes
                      </Link>
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {leads.length > 0 ? (
                  <div className="space-y-3">
                    {leads.map(lead => (
                      <div
                        key={lead.id}
                        className="flex items-center justify-between p-3 rounded-lg border border-slate-200 hover:border-slate-300 transition-colors"
                      >
                        <div>
                          <p className="font-medium text-slate-900">
                            {lead.package?.name || 'Package'}
                          </p>
                          <p className="text-sm text-slate-600">
                            {lead.vendor?.business_name || 'Vendor'}
                          </p>
                          <Badge variant={lead.status === 'quoted' ? 'success' : 'default'} className="mt-1">
                            {lead.status}
                          </Badge>
                        </div>
                        <Button size="sm" variant="outline" asChild>
                          <Link href={`/planner/leads/${lead.id}`}>View</Link>
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Package className="mx-auto h-12 w-12 text-slate-400 mb-3" />
                    <p className="text-slate-600 mb-4">No quotes requested yet</p>
                    <Button size="sm" asChild>
                      <Link href={`/planner/browse?eventId=${event.id}`}>
                        Browse Packages
                      </Link>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button className="w-full" asChild>
                  <Link href={`/planner/browse?eventId=${event.id}`}>
                    <Package className="mr-2 h-4 w-4" />
                    Find Matching Packages
                  </Link>
                </Button>
                <Button variant="outline" className="w-full" disabled>
                  Edit Event Details
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Event Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-600">Status</span>
                    <Badge variant={statusColors[event.status]}>{event.status}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-600">Quotes</span>
                    <span className="font-medium">{leads.length}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-600">Days Until Event</span>
                    <span className="font-medium">
                      {Math.ceil((new Date(event.event_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
