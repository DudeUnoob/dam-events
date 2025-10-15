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
import { ArrowLeft, CheckCircle, XCircle, Package as PackageIcon, Star } from 'lucide-react';
import Link from 'next/link';

export default function PlannerLeadDetailPage() {
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
    if (status === 'booked') {
      const confirmBooking = window.confirm(
        'Are you sure you want to book this vendor? This will notify the vendor of your confirmation.'
      );
      if (!confirmBooking) return;
    }

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

        if (status === 'booked') {
          alert('Booking confirmed! The vendor has been notified.');
        }
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
              onClick: () => router.push('/planner/dashboard'),
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
          <Link href="/planner/dashboard">
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
                    <CardTitle>Conversation with Vendor</CardTitle>
                    <p className="mt-1 text-sm text-slate-600">
                      {lead.vendor?.business_name || 'Vendor'}
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
                  receiverId={lead.vendor?.user_id || ''}
                />
              </CardContent>
            </Card>
          </div>

          {/* Sidebar - Vendor & Package Details */}
          <div className="space-y-6">
            {/* Vendor Details */}
            {lead.vendor && (
              <Card>
                <CardHeader>
                  <CardTitle>Vendor Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <p className="text-lg font-semibold text-slate-900">
                      {lead.vendor.business_name}
                    </p>
                    {lead.vendor.description && (
                      <p className="mt-1 text-sm text-slate-600">{lead.vendor.description}</p>
                    )}
                  </div>

                  {lead.vendor.location_address && (
                    <div>
                      <p className="text-sm font-medium text-slate-900">Location</p>
                      <p className="text-sm text-slate-600">{lead.vendor.location_address}</p>
                    </div>
                  )}

                  {lead.vendor.services && lead.vendor.services.length > 0 && (
                    <div>
                      <p className="text-sm font-medium text-slate-900">Services</p>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {lead.vendor.services.map((service) => (
                          <Badge key={service} variant="default">
                            {service}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Package Details */}
            {lead.package && (
              <Card>
                <CardHeader>
                  <CardTitle>Package Details</CardTitle>
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

                    {lead.package.photos && lead.package.photos.length > 0 && (
                      <div>
                        <p className="text-sm font-medium text-slate-900 mb-2">Photos</p>
                        <div className="grid grid-cols-2 gap-2">
                          {lead.package.photos.slice(0, 4).map((photo, idx) => (
                            <img
                              key={idx}
                              src={photo}
                              alt={`Package photo ${idx + 1}`}
                              className="h-20 w-full object-cover rounded"
                            />
                          ))}
                        </div>
                        {lead.package.photos.length > 4 && (
                          <p className="mt-2 text-xs text-slate-500">
                            +{lead.package.photos.length - 4} more photos
                          </p>
                        )}
                      </div>
                    )}

                    <Button variant="outline" size="sm" className="w-full" asChild>
                      <Link href={`/packages/${lead.package_id}`}>
                        <PackageIcon className="mr-2 h-4 w-4" />
                        View Full Package
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {lead.status === 'quoted' && (
                  <Button
                    className="w-full"
                    onClick={() => updateLeadStatus('booked')}
                    disabled={updating}
                  >
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Confirm Booking
                  </Button>
                )}

                {lead.status !== 'closed' && lead.status !== 'booked' ? (
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => updateLeadStatus('closed')}
                    disabled={updating}
                  >
                    <XCircle className="mr-2 h-4 w-4" />
                    Close Lead
                  </Button>
                ) : null}

                {lead.status === 'new' && (
                  <p className="text-xs text-center text-slate-500 mt-4">
                    Waiting for vendor to respond...
                  </p>
                )}

                {lead.status === 'booked' && (
                  <div className="rounded-lg bg-green-50 border border-green-200 p-3 text-center">
                    <CheckCircle className="mx-auto h-6 w-6 text-green-600 mb-2" />
                    <p className="text-sm font-medium text-green-900">Booking Confirmed!</p>
                    <p className="text-xs text-green-700 mt-1">
                      The vendor will contact you soon
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
