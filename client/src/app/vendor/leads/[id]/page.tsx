'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Skeleton';
import { ErrorState } from '@/components/shared/ErrorState';
import { MessageThread } from '@/components/messaging/MessageThread';
import { Lead } from '@/types';
import { formatCurrency, formatDate } from '@/lib/utils';
import { ArrowLeft, Calendar, Users, DollarSign, MapPin, CheckCircle, XCircle } from 'lucide-react';
import Link from 'next/link';

export default function VendorLeadDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [lead, setLead] = useState<Lead | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updating, setUpdating] = useState(false);

  const leadId = params.id as string;

  useEffect(() => {
    if (!user) return;

    const fetchLead = async () => {
      try {
        const response = await fetch(`/api/leads/${leadId}`);
        const data = await response.json();

        if (response.ok && data.data) {
          setLead(data.data);

          // Auto-mark as viewed if status is new
          if (data.data.status === 'new') {
            await updateLeadStatus('viewed');
          }
        } else {
          setError(data.error?.message || 'Lead not found');
        }
      } catch (err) {
        console.error('Error fetching lead:', err);
        setError('Failed to load lead details');
      } finally {
        setLoading(false);
      }
    };

    fetchLead();
  }, [user, leadId]);

  const updateLeadStatus = async (status: string) => {
    setUpdating(true);

    try {
      const response = await fetch(`/api/leads/${leadId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      });

      const data = await response.json();

      if (response.ok && data.data) {
        setLead(data.data);
      } else {
        alert(data.error?.message || 'Failed to update status');
      }
    } catch (err) {
      console.error('Error updating lead:', err);
      alert('Failed to update lead status');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 py-8">
        <div className="mx-auto max-w-7xl px-4">
          <Skeleton className="h-96 w-full" />
        </div>
      </div>
    );
  }

  if (error || !lead) {
    return (
      <div className="min-h-screen bg-slate-50 py-8">
        <div className="mx-auto max-w-7xl px-4">
          <ErrorState
            title="Failed to load lead"
            message={error || 'Lead not found'}
            action={{
              label: 'Back to Dashboard',
              onClick: () => router.push('/vendor/dashboard'),
            }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="mx-auto max-w-7xl px-4">
        {/* Back Button */}
        <Button variant="ghost" size="sm" className="mb-6" asChild>
          <Link href="/vendor/dashboard">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Link>
        </Button>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main Content - Messages */}
          <div className="lg:col-span-2">
            <Card className="h-[600px]">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Conversation with Planner</CardTitle>
                    <p className="mt-1 text-sm text-slate-600">
                      {lead.event?.event_type}
                    </p>
                  </div>
                  <Badge
                    variant={
                      lead.status === 'new'
                        ? 'danger'
                        : lead.status === 'quoted'
                        ? 'warning'
                        : lead.status === 'booked'
                        ? 'success'
                        : 'default'
                    }
                  >
                    {lead.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="h-[calc(100%-5rem)]">
                <MessageThread
                  leadId={leadId}
                  currentUserId={user!.id}
                  receiverId={lead.planner_id}
                />
              </CardContent>
            </Card>
          </div>

          {/* Sidebar - Event & Package Details */}
          <div className="space-y-6">
            {/* Event Details */}
            <Card>
              <CardHeader>
                <CardTitle>Event Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {lead.event && (
                  <>
                    <div className="flex items-start gap-3">
                      <Calendar className="mt-0.5 h-5 w-5 text-slate-400" />
                      <div>
                        <p className="text-sm font-medium text-slate-900">Event Date</p>
                        <p className="text-sm text-slate-600">
                          {formatDate(lead.event.event_date)}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <Users className="mt-0.5 h-5 w-5 text-slate-400" />
                      <div>
                        <p className="text-sm font-medium text-slate-900">Guest Count</p>
                        <p className="text-sm text-slate-600">{lead.event.guest_count} guests</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <DollarSign className="mt-0.5 h-5 w-5 text-slate-400" />
                      <div>
                        <p className="text-sm font-medium text-slate-900">Budget</p>
                        <p className="text-sm text-slate-600">
                          {formatCurrency(lead.event.budget)}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <MapPin className="mt-0.5 h-5 w-5 text-slate-400" />
                      <div>
                        <p className="text-sm font-medium text-slate-900">Location</p>
                        <p className="text-sm text-slate-600">{lead.event.location_address}</p>
                      </div>
                    </div>

                    {lead.event.description && (
                      <div>
                        <p className="text-sm font-medium text-slate-900">Description</p>
                        <p className="mt-1 text-sm text-slate-600">{lead.event.description}</p>
                      </div>
                    )}
                  </>
                )}
              </CardContent>
            </Card>

            {/* Package Details */}
            {lead.package && (
              <Card>
                <CardHeader>
                  <CardTitle>Package</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <p className="font-semibold text-slate-900">{lead.package.name}</p>
                      <p className="mt-1 text-sm text-slate-600">{lead.package.description}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-900">Price Range</p>
                      <p className="text-sm text-slate-600">
                        {formatCurrency(lead.package.price_min)} -{' '}
                        {formatCurrency(lead.package.price_max)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-900">Capacity</p>
                      <p className="text-sm text-slate-600">
                        Up to {lead.package.capacity} guests
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Lead Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {lead.status === 'viewed' || lead.status === 'new' ? (
                  <Button
                    className="w-full"
                    onClick={() => updateLeadStatus('quoted')}
                    disabled={updating}
                  >
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Mark as Quoted
                  </Button>
                ) : null}

                {lead.status !== 'declined' && lead.status !== 'booked' ? (
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => updateLeadStatus('declined')}
                    disabled={updating}
                  >
                    <XCircle className="mr-2 h-4 w-4" />
                    Decline Lead
                  </Button>
                ) : null}

                {lead.status === 'quoted' && (
                  <p className="text-xs text-center text-slate-500 mt-4">
                    Waiting for planner to confirm booking
                  </p>
                )}

                {lead.status === 'booked' && (
                  <div className="rounded-lg bg-green-50 border border-green-200 p-3 text-center">
                    <CheckCircle className="mx-auto h-6 w-6 text-green-600 mb-2" />
                    <p className="text-sm font-medium text-green-900">
                      This lead is booked!
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
