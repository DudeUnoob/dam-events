'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { LeadCard } from '@/components/vendor/LeadCard';
import { Skeleton } from '@/components/ui/Skeleton';
import { ErrorState } from '@/components/shared/ErrorState';
import { Plus, Package, MessageSquare, TrendingUp, DollarSign, RefreshCw } from 'lucide-react';
import { Lead } from '@/types';

export default function VendorDashboard() {
  const { user, loading: authLoading } = useAuth();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLeads = async () => {
    if (!user) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/leads?role=vendor');
      const data = await response.json();

      if (response.ok && data.data) {
        setLeads(data.data);
      } else {
        setError(data.error?.message || 'Failed to fetch leads');
      }
    } catch (err) {
      console.error('Error fetching leads:', err);
      setError('Failed to load leads. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user && !authLoading) {
      fetchLeads();
    }
  }, [user, authLoading]);

  const newLeads = leads.filter((l) => l.status === 'new').length;
  const quotedLeads = leads.filter((l) => l.status === 'quoted').length;
  const bookedLeads = leads.filter((l) => l.status === 'booked').length;
  const estimatedRevenue = leads
    .filter((l) => l.status === 'booked')
    .reduce((sum, lead) => sum + (lead.event?.budget || 0), 0);

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Vendor Dashboard</h1>
            <p className="mt-2 text-slate-600">Manage your leads and packages</p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" size="sm" onClick={fetchLeads} disabled={loading}>
              <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button asChild>
              <Link href="/vendor/packages/create">
                <Plus className="mr-2 h-5 w-5" />
                Create Package
              </Link>
            </Button>
          </div>
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
                  <p className="text-2xl font-bold text-slate-900">
                    ${estimatedRevenue.toLocaleString()}
                  </p>
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

          {loading ? (
            <div className="grid gap-6 lg:grid-cols-2">
              {[1, 2, 3, 4].map((i) => (
                <Card key={i}>
                  <CardContent className="p-6">
                    <Skeleton className="h-24 w-full" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : error ? (
            <ErrorState
              title="Failed to load leads"
              message={error}
              onRetry={fetchLeads}
            />
          ) : leads.length > 0 ? (
            <div className="grid gap-6 lg:grid-cols-2">
              {leads.map((lead) => (
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
