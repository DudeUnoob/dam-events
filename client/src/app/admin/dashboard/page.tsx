'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Skeleton';
import { ErrorState } from '@/components/shared/ErrorState';
import { Vendor } from '@/types';
import { formatDate } from '@/lib/utils';
import { Shield, CheckCircle, XCircle, Clock, Users, Package, RefreshCw, TrendingUp, BarChart3 } from 'lucide-react';

interface AdminStats {
  pendingVendors: number;
  verifiedVendors: number;
  activePackages: number;
  totalUsers: number;
}

interface VendorAnalytics {
  vendor_id: string;
  business_name: string;
  email: string;
  status: string;
  package_count: number;
  lead_count: number;
  booked_count: number;
  conversion_rate: number;
  avg_response_time_hours: number | null;
  created_at: string;
}

export default function AdminDashboard() {
  const { user } = useAuth();
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [vendorAnalytics, setVendorAnalytics] = useState<VendorAnalytics[]>([]);
  const [loading, setLoading] = useState(true);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [updating, setUpdating] = useState<string | null>(null);
  const [showAnalytics, setShowAnalytics] = useState(false);

  const fetchVendors = async () => {
    setLoading(true);
    setError(null);

    try {
      // Fetch both vendors and stats in parallel
      const [vendorsResponse, statsResponse] = await Promise.all([
        fetch('/api/admin/vendors?status=pending'),
        fetch('/api/admin/stats'),
      ]);

      const vendorsData = await vendorsResponse.json();
      const statsData = await statsResponse.json();

      if (vendorsResponse.ok && vendorsData.data) {
        setVendors(vendorsData.data);
      } else {
        setError(vendorsData.error?.message || 'Failed to fetch vendors');
      }

      if (statsResponse.ok && statsData.data) {
        setStats(statsData.data);
      }
    } catch (err) {
      console.error('Error fetching vendors:', err);
      setError('Failed to load pending vendors');
    } finally {
      setLoading(false);
    }
  };

  const fetchVendorAnalytics = async () => {
    setAnalyticsLoading(true);
    try {
      const response = await fetch('/api/admin/vendors/analytics');
      const data = await response.json();

      if (response.ok && data.data) {
        setVendorAnalytics(data.data);
      } else {
        console.error('Failed to fetch analytics:', data.error);
      }
    } catch (err) {
      console.error('Error fetching vendor analytics:', err);
    } finally {
      setAnalyticsLoading(false);
    }
  };

  useEffect(() => {
    if (user && user.role === 'admin') {
      fetchVendors();
    }
  }, [user]);

  const handleApprove = async (vendorId: string) => {
    setUpdating(vendorId);

    try {
      const response = await fetch(`/api/admin/vendors/${vendorId}/verify`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: 'verified' }),
      });

      const data = await response.json();

      if (response.ok) {
        setVendors(vendors.filter((v) => v.id !== vendorId));
        alert('Vendor approved successfully!');
      } else {
        alert(data.error?.message || 'Failed to approve vendor');
      }
    } catch (err) {
      console.error('Error approving vendor:', err);
      alert('Failed to approve vendor');
    } finally {
      setUpdating(null);
    }
  };

  const handleReject = async (vendorId: string) => {
    const reason = prompt('Please provide a reason for rejection (optional):');

    setUpdating(vendorId);

    try {
      const response = await fetch(`/api/admin/vendors/${vendorId}/verify`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: 'rejected',
          reason: reason || 'Did not meet platform criteria',
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setVendors(vendors.filter((v) => v.id !== vendorId));
        alert('Vendor rejected');
      } else {
        alert(data.error?.message || 'Failed to reject vendor');
      }
    } catch (err) {
      console.error('Error rejecting vendor:', err);
      alert('Failed to reject vendor');
    } finally {
      setUpdating(null);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-accent-100 p-3">
                <Shield className="h-8 w-8 text-accent-600" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-slate-900">Admin Dashboard</h1>
                <p className="text-slate-600">Manage vendor applications and platform operations</p>
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={fetchVendors} disabled={loading}>
              <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="rounded-lg bg-yellow-100 p-3">
                  <Clock className="h-6 w-6 text-yellow-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-900">
                    {stats ? stats.pendingVendors : vendors.length}
                  </p>
                  <p className="text-sm text-slate-600">Pending Review</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="rounded-lg bg-green-100 p-3">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-900">
                    {stats ? stats.verifiedVendors : '—'}
                  </p>
                  <p className="text-sm text-slate-600">Verified Vendors</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="rounded-lg bg-primary-100 p-3">
                  <Package className="h-6 w-6 text-primary-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-900">
                    {stats ? stats.activePackages : '—'}
                  </p>
                  <p className="text-sm text-slate-600">Active Packages</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="rounded-lg bg-secondary-100 p-3">
                  <Users className="h-6 w-6 text-secondary-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-900">
                    {stats ? stats.totalUsers : '—'}
                  </p>
                  <p className="text-sm text-slate-600">Total Users</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Vendor Analytics */}
        <div className="mt-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-slate-900 flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Vendor Performance Analytics
            </h2>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                if (!showAnalytics) {
                  fetchVendorAnalytics();
                }
                setShowAnalytics(!showAnalytics);
              }}
            >
              {showAnalytics ? 'Hide Analytics' : 'View Analytics'}
            </Button>
          </div>

          {showAnalytics && (
            <Card>
              <CardContent className="p-0">
                {analyticsLoading ? (
                  <div className="p-12 text-center">
                    <RefreshCw className="h-8 w-8 animate-spin mx-auto text-primary-600" />
                    <p className="mt-4 text-slate-600">Loading analytics...</p>
                  </div>
                ) : vendorAnalytics.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-slate-50 border-b border-slate-200">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-slate-700 uppercase tracking-wider">
                            Vendor
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-slate-700 uppercase tracking-wider">
                            Status
                          </th>
                          <th className="px-6 py-3 text-center text-xs font-medium text-slate-700 uppercase tracking-wider">
                            Packages
                          </th>
                          <th className="px-6 py-3 text-center text-xs font-medium text-slate-700 uppercase tracking-wider">
                            Leads
                          </th>
                          <th className="px-6 py-3 text-center text-xs font-medium text-slate-700 uppercase tracking-wider">
                            Booked
                          </th>
                          <th className="px-6 py-3 text-center text-xs font-medium text-slate-700 uppercase tracking-wider">
                            Conv. Rate
                          </th>
                          <th className="px-6 py-3 text-center text-xs font-medium text-slate-700 uppercase tracking-wider">
                            Avg Response
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-slate-200">
                        {vendorAnalytics.map((analytics) => (
                          <tr key={analytics.vendor_id} className="hover:bg-slate-50">
                            <td className="px-6 py-4">
                              <div>
                                <p className="text-sm font-medium text-slate-900">
                                  {analytics.business_name}
                                </p>
                                <p className="text-xs text-slate-500">{analytics.email}</p>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <Badge
                                variant={
                                  analytics.status === 'verified'
                                    ? 'success'
                                    : analytics.status === 'pending'
                                    ? 'warning'
                                    : 'danger'
                                }
                              >
                                {analytics.status}
                              </Badge>
                            </td>
                            <td className="px-6 py-4 text-center">
                              <span className="text-sm text-slate-900">{analytics.package_count}</span>
                            </td>
                            <td className="px-6 py-4 text-center">
                              <span className="text-sm text-slate-900">{analytics.lead_count}</span>
                            </td>
                            <td className="px-6 py-4 text-center">
                              <span className="text-sm font-medium text-green-600">
                                {analytics.booked_count}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-center">
                              <div className="flex items-center justify-center gap-1">
                                <span
                                  className={`text-sm font-semibold ${
                                    analytics.conversion_rate >= 25
                                      ? 'text-green-600'
                                      : analytics.conversion_rate >= 10
                                      ? 'text-yellow-600'
                                      : 'text-slate-600'
                                  }`}
                                >
                                  {analytics.conversion_rate}%
                                </span>
                                {analytics.conversion_rate >= 25 && (
                                  <TrendingUp className="h-4 w-4 text-green-600" />
                                )}
                              </div>
                            </td>
                            <td className="px-6 py-4 text-center">
                              {analytics.avg_response_time_hours !== null ? (
                                <span
                                  className={`text-sm ${
                                    analytics.avg_response_time_hours <= 24
                                      ? 'text-green-600 font-medium'
                                      : analytics.avg_response_time_hours <= 48
                                      ? 'text-yellow-600'
                                      : 'text-red-600'
                                  }`}
                                >
                                  {analytics.avg_response_time_hours < 1
                                    ? `${Math.round(analytics.avg_response_time_hours * 60)}m`
                                    : `${analytics.avg_response_time_hours.toFixed(1)}h`}
                                </span>
                              ) : (
                                <span className="text-sm text-slate-400">—</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="p-12 text-center">
                    <BarChart3 className="h-12 w-12 mx-auto text-slate-400" />
                    <p className="mt-4 text-slate-600">No vendor data available</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Pending Vendors */}
        <div className="mt-8">
          <h2 className="mb-6 text-xl font-semibold text-slate-900">
            Pending Vendor Applications
          </h2>

          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Card key={i}>
                  <CardContent className="p-6">
                    <Skeleton className="h-32 w-full" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : error ? (
            <ErrorState
              title="Failed to load vendors"
              message={error}
              onRetry={fetchVendors}
            />
          ) : vendors.length > 0 ? (
            <div className="space-y-4">
              {vendors.map((vendor) => (
                <Card key={vendor.id}>
                  <CardContent className="p-6">
                    <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
                      {/* Vendor Info */}
                      <div className="flex-1">
                        <div className="flex items-start gap-4">
                          <div className="rounded-lg bg-slate-100 p-3">
                            <Package className="h-6 w-6 text-slate-600" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-3">
                              <h3 className="text-lg font-semibold text-slate-900">
                                {vendor.business_name}
                              </h3>
                              <Badge variant="warning">Pending</Badge>
                            </div>

                            <p className="mt-2 text-sm text-slate-600">{vendor.description}</p>

                            <div className="mt-4 space-y-2">
                              <div className="flex flex-wrap gap-2">
                                <span className="text-sm text-slate-500">Services:</span>
                                {vendor.services.map((service) => (
                                  <Badge key={service} variant="default">
                                    {service}
                                  </Badge>
                                ))}
                              </div>

                              <p className="text-sm text-slate-600">
                                <span className="font-medium">Location:</span>{' '}
                                {vendor.location_address}
                              </p>

                              <p className="text-sm text-slate-500">
                                Applied {formatDate(vendor.created_at)}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex gap-3 lg:flex-col">
                        <Button
                          variant="secondary"
                          size="sm"
                          className="flex-1 lg:flex-none"
                          onClick={() => handleApprove(vendor.id)}
                          disabled={updating === vendor.id}
                        >
                          <CheckCircle className="mr-2 h-4 w-4" />
                          {updating === vendor.id ? 'Approving...' : 'Approve'}
                        </Button>
                        <Button
                          variant="danger"
                          size="sm"
                          className="flex-1 lg:flex-none"
                          onClick={() => handleReject(vendor.id)}
                          disabled={updating === vendor.id}
                        >
                          <XCircle className="mr-2 h-4 w-4" />
                          {updating === vendor.id ? 'Rejecting...' : 'Reject'}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="p-12 text-center">
                <CheckCircle className="mx-auto h-12 w-12 text-green-500" />
                <h3 className="mt-4 text-lg font-semibold text-slate-900">
                  All caught up!
                </h3>
                <p className="mt-2 text-slate-600">
                  No pending vendor applications at this time
                </p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Recent Activity */}
        <div className="mt-8">
          <h2 className="mb-6 text-xl font-semibold text-slate-900">Recent Activity</h2>
          <Card>
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="flex items-start gap-3 border-b border-slate-100 pb-4">
                  <div className="rounded-full bg-green-100 p-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-slate-900">
                      <span className="font-medium">Downtown Venue Co</span> was approved
                    </p>
                    <p className="text-xs text-slate-500">2 hours ago</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 border-b border-slate-100 pb-4">
                  <div className="rounded-full bg-blue-100 p-2">
                    <Package className="h-4 w-4 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-slate-900">
                      New package created by <span className="font-medium">Elite Events</span>
                    </p>
                    <p className="text-xs text-slate-500">5 hours ago</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="rounded-full bg-primary-100 p-2">
                    <Users className="h-4 w-4 text-primary-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-slate-900">
                      <span className="font-medium">5 new users</span> registered today
                    </p>
                    <p className="text-xs text-slate-500">8 hours ago</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
