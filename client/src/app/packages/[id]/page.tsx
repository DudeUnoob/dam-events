'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/Toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { CardSkeleton } from '@/components/ui/Skeleton';
import { ErrorState } from '@/components/shared/ErrorState';
import { EventSelectionModal } from '@/components/planner/EventSelectionModal';
import {
  Building2,
  Users,
  DollarSign,
  MapPin,
  Utensils,
  Music,
  CheckCircle,
  ArrowLeft,
  Sparkles,
} from 'lucide-react';
import { Package, Event } from '@/types';
import { formatCurrency } from '@/lib/utils';
import Link from 'next/link';

export default function PackageDetailPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user } = useAuth();
  const { showToast } = useToast();

  const packageId = params.id as string;
  const eventId = searchParams.get('eventId');

  const [pkg, setPkg] = useState<Package | null>(null);
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [requesting, setRequesting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [selectedEventIdForQuote, setSelectedEventIdForQuote] = useState<string | null>(null);

  // Track if quote has been requested to prevent duplicates
  const quoteRequestedRef = useRef(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch package
        const pkgResponse = await fetch(`/api/packages/${packageId}`);
        const pkgData = await pkgResponse.json();

        if (!pkgResponse.ok || pkgData.error) {
          throw new Error(pkgData.error?.message || 'Package not found');
        }

        setPkg(pkgData.data);

        // Fetch event if eventId provided
        if (eventId) {
          const eventResponse = await fetch(`/api/events/${eventId}`);
          const eventData = await eventResponse.json();
          if (eventResponse.ok && eventData.data) {
            setEvent(eventData.data);
          }
        }
      } catch (err: any) {
        console.error('Error fetching package:', err);
        setError(err.message || 'Failed to load package');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [packageId, eventId]);

  const handleRequestQuote = useCallback(async () => {
    if (!user) {
      showToast('Please sign in to request a quote', 'error');
      router.push('/login');
      return;
    }

    if (!eventId && !selectedEventIdForQuote) {
      // Open modal to select or create an event
      setIsEventModalOpen(true);
      return;
    }

    // Prevent duplicate submissions
    if (quoteRequestedRef.current) {
      console.log('Quote request already in progress, skipping duplicate');
      return;
    }

    const effectiveEventId = selectedEventIdForQuote || eventId;

    try {
      quoteRequestedRef.current = true;
      setRequesting(true);

      const response = await fetch('/api/leads', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          eventId: effectiveEventId,
          packageId,
        }),
      });

      const data = await response.json();

      if (!response.ok || data.error) {
        throw new Error(data.error?.message || 'Failed to request quote');
      }

      showToast('Quote requested successfully!', 'success');
      // Clear selected event and session storage
      setSelectedEventIdForQuote(null);
      sessionStorage.removeItem(`autoSubmitQuote_${packageId}`);
      router.push(`/planner/leads/${data.data.id}`);
    } catch (err: any) {
      console.error('Error requesting quote:', err);
      showToast(err.message || 'Failed to request quote', 'error');
      // Reset flag on error so user can retry
      quoteRequestedRef.current = false;
    } finally {
      setRequesting(false);
    }
  }, [user, eventId, selectedEventIdForQuote, packageId, showToast, router]);

  const handleEventSelected = (selectedEventId: string) => {
    setSelectedEventIdForQuote(selectedEventId);
    // After setting the event, trigger the quote request
    setIsEventModalOpen(false);
    // We need to wait for state to update, so we'll use useEffect
  };

  // Auto-submit quote when event is selected from modal
  useEffect(() => {
    if (selectedEventIdForQuote && !requesting) {
      handleRequestQuote();
    }
  }, [selectedEventIdForQuote, requesting, handleRequestQuote]);

  // Auto-submit quote when returning from event creation
  useEffect(() => {
    if (eventId && pkg && user && !requesting) {
      // Check if we should auto-submit (e.g., user just created an event and came back)
      // We'll use sessionStorage to track if we should auto-submit
      const shouldAutoSubmit = sessionStorage.getItem(`autoSubmitQuote_${packageId}`);

      if (shouldAutoSubmit === 'true') {
        sessionStorage.removeItem(`autoSubmitQuote_${packageId}`);
        handleRequestQuote();
      }
    }
  }, [eventId, pkg, user, requesting, packageId, handleRequestQuote]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 py-8">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <CardSkeleton />
        </div>
      </div>
    );
  }

  if (error || !pkg) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Card className="max-w-md">
          <ErrorState
            title="Package Not Found"
            message={error || 'This package does not exist'}
            onRetry={() => router.back()}
            showRetry={false}
          />
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <Button variant="ghost" size="sm" className="mb-6" onClick={() => router.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>

        {/* Match Banner */}
        {event && pkg.score !== undefined && (
          <Card className="mb-6 border-green-200 bg-green-50">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Sparkles className="h-6 w-6 text-green-600" />
                <div>
                  <p className="font-semibold text-green-900">
                    {Math.round(pkg.score)}% Match for Your Event
                  </p>
                  <p className="text-sm text-green-700">
                    This package is a great fit for your {event.event_type} event
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Header Image */}
            <Card>
              <div className="relative h-96 w-full bg-gradient-to-br from-slate-200 to-slate-300">
                {pkg.photos && pkg.photos.length > 0 ? (
                  <img
                    src={pkg.photos[0]}
                    alt={pkg.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center">
                    <Building2 className="h-24 w-24 text-slate-400" />
                  </div>
                )}
              </div>
            </Card>

            {/* Package Info */}
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    {pkg.vendor && (
                      <p className="text-sm font-medium text-primary-600">
                        {pkg.vendor.business_name}
                      </p>
                    )}
                    <CardTitle className="text-2xl mt-1">{pkg.name}</CardTitle>
                    {pkg.distance !== undefined && (
                      <p className="text-sm text-slate-600 mt-1 flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        {pkg.distance.toFixed(1)} miles away
                      </p>
                    )}
                  </div>
                  <Badge variant="success">Published</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="font-semibold text-slate-900 mb-2">Description</h3>
                  <p className="text-slate-700">{pkg.description}</p>
                </div>

                {/* Venue Details */}
                {pkg.venue_details && (
                  <div>
                    <h3 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
                      <Building2 className="h-5 w-5" />
                      Venue Details
                    </h3>
                    <div className="rounded-lg bg-slate-50 p-4 space-y-2">
                      <p className="font-medium">{pkg.venue_details.name}</p>
                      <p className="text-sm text-slate-600">
                        Capacity: {pkg.venue_details.capacity} guests
                      </p>
                      {pkg.venue_details.amenities && pkg.venue_details.amenities.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-2">
                          {pkg.venue_details.amenities.map((amenity, i) => (
                            <Badge key={i} variant="default">{amenity}</Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Catering Details */}
                {pkg.catering_details && (
                  <div>
                    <h3 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
                      <Utensils className="h-5 w-5" />
                      Catering
                    </h3>
                    <div className="rounded-lg bg-slate-50 p-4 space-y-2">
                      {pkg.catering_details.menu_options && (
                        <div>
                          <p className="text-sm font-medium text-slate-700">Menu Options:</p>
                          <p className="text-sm text-slate-600">
                            {pkg.catering_details.menu_options.join(', ')}
                          </p>
                        </div>
                      )}
                      {pkg.catering_details.dietary_accommodations && (
                        <div>
                          <p className="text-sm font-medium text-slate-700">Dietary Options:</p>
                          <p className="text-sm text-slate-600">
                            {pkg.catering_details.dietary_accommodations.join(', ')}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Entertainment Details */}
                {pkg.entertainment_details && (
                  <div>
                    <h3 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
                      <Music className="h-5 w-5" />
                      Entertainment
                    </h3>
                    <div className="rounded-lg bg-slate-50 p-4 space-y-2">
                      <p className="text-sm text-slate-600">
                        Type: {pkg.entertainment_details.type}
                      </p>
                      {pkg.entertainment_details.equipment && (
                        <div className="flex flex-wrap gap-2 mt-2">
                          {pkg.entertainment_details.equipment.map((item, i) => (
                            <Badge key={i} variant="default">{item}</Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Pricing Card */}
            <Card>
              <CardHeader>
                <CardTitle>Pricing</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-slate-600">Price Range</p>
                    <p className="text-3xl font-bold text-slate-900">
                      {formatCurrency(pkg.price_min)}
                    </p>
                    <p className="text-sm text-slate-600">to {formatCurrency(pkg.price_max)}</p>
                  </div>

                  <div className="pt-4 border-t space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <Users className="h-4 w-4 text-slate-600" />
                      <span>Up to {pkg.capacity} guests</span>
                    </div>
                    {pkg.distance !== undefined && (
                      <div className="flex items-center gap-2 text-sm">
                        <MapPin className="h-4 w-4 text-slate-600" />
                        <span>{pkg.distance.toFixed(1)} mi from your event</span>
                      </div>
                    )}
                  </div>

                  <Button
                    className="w-full mt-4"
                    size="lg"
                    onClick={handleRequestQuote}
                    disabled={requesting}
                  >
                    {requesting ? 'Requesting...' : 'Request Quote'}
                  </Button>

                  {!eventId && !selectedEventIdForQuote && (
                    <p className="text-xs text-center text-slate-500">
                      You&apos;ll be able to select or create an event
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Vendor Info */}
            {pkg.vendor && (
              <Card>
                <CardHeader>
                  <CardTitle>Vendor Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <p className="font-medium text-slate-900">{pkg.vendor.business_name}</p>
                    <p className="text-sm text-slate-600 mt-1">{pkg.vendor.description}</p>
                  </div>
                  <div className="pt-3 border-t">
                    <p className="text-sm text-slate-600 mb-2">Services:</p>
                    <div className="flex flex-wrap gap-2">
                      {pkg.vendor.services.map((service, i) => (
                        <Badge key={i} variant="default">{service}</Badge>
                      ))}
                    </div>
                  </div>
                  <div className="pt-3 border-t">
                    <p className="text-sm text-slate-600 flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      {pkg.vendor.location_address}
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Event Selection Modal */}
        <EventSelectionModal
          isOpen={isEventModalOpen}
          onClose={() => setIsEventModalOpen(false)}
          onSelectEvent={handleEventSelected}
          packageId={packageId}
        />
      </div>
    </div>
  );
}
