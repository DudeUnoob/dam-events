'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Skeleton';
import { ErrorState } from '@/components/shared/ErrorState';
import { Package as PackageType } from '@/types';
import { formatCurrency } from '@/lib/utils';
import { Plus, Package, Edit, Eye, Trash2, AlertCircle } from 'lucide-react';
import Link from 'next/link';

export default function VendorPackagesPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [packages, setPackages] = useState<PackageType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [vendorId, setVendorId] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;

    const fetchPackages = async () => {
      try {
        // First get vendor ID
        const vendorResponse = await fetch('/api/vendors');
        const vendorData = await vendorResponse.json();

        if (!vendorResponse.ok) {
          setError(vendorData.error?.message || 'Failed to fetch vendor profile');
          setLoading(false);
          return;
        }

        // If vendor doesn't exist yet, that's okay - show empty state
        if (!vendorData.data) {
          setVendorId(null);
          setPackages([]);
          setLoading(false);
          return;
        }

        setVendorId(vendorData.data.id);

        // Then get packages for this vendor
        const response = await fetch(`/api/packages?vendorId=${vendorData.data.id}`);
        const data = await response.json();

        if (response.ok && data.data) {
          setPackages(data.data);
        } else {
          setError(data.error?.message || 'Failed to fetch packages');
        }
      } catch (err) {
        console.error('Error fetching packages:', err);
        setError('Failed to load packages');
      } finally {
        setLoading(false);
      }
    };

    fetchPackages();
  }, [user]);

  const handleDelete = async (packageId: string) => {
    if (!confirm('Are you sure you want to delete this package? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch(`/api/packages/${packageId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setPackages(packages.filter(pkg => pkg.id !== packageId));
        alert('Package deleted successfully');
      } else {
        const data = await response.json();
        alert(data.error?.message || 'Failed to delete package');
      }
    } catch (err) {
      console.error('Error deleting package:', err);
      alert('Failed to delete package');
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

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 py-8">
        <div className="mx-auto max-w-7xl px-4">
          <ErrorState
            title="Failed to load packages"
            message={error}
            onRetry={() => router.push('/vendor/dashboard')}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">My Packages</h1>
            <p className="mt-2 text-slate-600">
              Manage your event packages and pricing
            </p>
          </div>
          <Button asChild>
            <Link href="/vendor/packages/create">
              <Plus className="mr-2 h-5 w-5" />
              Create Package
            </Link>
          </Button>
        </div>

        {/* Show message if vendor profile doesn't exist */}
        {vendorId === null ? (
          <Card>
            <CardContent className="p-12 text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-yellow-100">
                <AlertCircle className="h-8 w-8 text-yellow-600" />
              </div>
              <h3 className="mb-2 text-lg font-semibold text-slate-900">
                Complete Your Vendor Profile
              </h3>
              <p className="mb-6 text-slate-600">
                You need to complete your vendor profile before you can create packages
              </p>
              <Button asChild>
                <Link href="/vendor/onboarding">
                  Complete Profile
                </Link>
              </Button>
            </CardContent>
          </Card>
        ) : packages.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {packages.map((pkg) => (
              <Card key={pkg.id} className="overflow-hidden">
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <div className="rounded-lg bg-primary-100 p-2">
                        <Package className="h-5 w-5 text-primary-600" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{pkg.name}</CardTitle>
                        <Badge
                          variant={pkg.status === 'published' ? 'success' : 'default'}
                          className="mt-1"
                        >
                          {pkg.status}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardHeader>

                <CardContent>
                  <div className="space-y-3">
                    {/* Photo Preview */}
                    {pkg.photos && pkg.photos.length > 0 && (
                      <div className="aspect-video overflow-hidden rounded-lg bg-slate-100">
                        <img
                          src={pkg.photos[0]}
                          alt={pkg.name}
                          className="h-full w-full object-cover"
                        />
                      </div>
                    )}

                    {/* Description */}
                    <p className="line-clamp-2 text-sm text-slate-600">
                      {pkg.description}
                    </p>

                    {/* Price & Capacity */}
                    <div className="space-y-1 text-sm">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500">Price Range:</span>
                        <span className="font-semibold text-slate-900">
                          {formatCurrency(pkg.price_min)} - {formatCurrency(pkg.price_max)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500">Capacity:</span>
                        <span className="font-semibold text-slate-900">
                          Up to {pkg.capacity} guests
                        </span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 pt-2">
                      <Button variant="outline" size="sm" className="flex-1" asChild>
                        <Link href={`/packages/${pkg.id}`}>
                          <Eye className="mr-2 h-4 w-4" />
                          View
                        </Link>
                      </Button>
                      <Button variant="outline" size="sm" className="flex-1" asChild>
                        <Link href={`/vendor/packages/${pkg.id}/edit`}>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
                        </Link>
                      </Button>
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => handleDelete(pkg.id)}
                      >
                        <Trash2 className="h-4 w-4" />
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
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-100">
                <Package className="h-8 w-8 text-slate-400" />
              </div>
              <h3 className="mb-2 text-lg font-semibold text-slate-900">
                No packages yet
              </h3>
              <p className="mb-6 text-slate-600">
                Create your first event package to start receiving leads from planners
              </p>
              <Button asChild>
                <Link href="/vendor/packages/create">
                  <Plus className="mr-2 h-5 w-5" />
                  Create Your First Package
                </Link>
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
