'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { VendorDashboardTabs } from '@/components/vendor/dashboard/VendorDashboardTabs';
import { ServiceTypeTabs } from '@/components/vendor/dashboard/ServiceTypeTabs';
import { AnalyticsOverview } from '@/components/vendor/analytics/AnalyticsOverview';
import { Skeleton } from '@/components/ui/Skeleton';
import { Vendor, ServiceType } from '@/types';

export default function VendorAnalytics() {
  const { user, loading: authLoading, signOut } = useAuth();
  const router = useRouter();
  const [vendor, setVendor] = useState<Vendor | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeService, setActiveService] = useState<ServiceType>('venue');
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);

  // Fetch vendor profile to get services
  const fetchVendor = useCallback(async () => {
    if (!user) return;

    setLoading(true);
    try {
      const response = await fetch('/api/vendors');
      const data = await response.json();

      if (response.ok && data.data) {
        setVendor(data.data);
        // Set initial active service to vendor's first service
        if (data.data.services && data.data.services.length > 0) {
          setActiveService(data.data.services[0] as ServiceType);
        }
      }
    } catch (err) {
      console.error('Error fetching vendor:', err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user && !authLoading) {
      fetchVendor();
    }
  }, [user, authLoading, fetchVendor]);

  // Get vendor services (default to venue if not available)
  const vendorServices: ServiceType[] = vendor?.services?.length
    ? (vendor.services as ServiceType[])
    : ['venue'];

  // Handle profile menu
  const handleProfileClick = () => {
    setProfileMenuOpen(!profileMenuOpen);
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto max-w-[1512px] px-4 py-4 sm:px-6 lg:px-[43px]">
        {/* Tab Navigation */}
        <VendorDashboardTabs onProfileClick={handleProfileClick} />

        {/* Profile Dropdown Menu */}
        {profileMenuOpen && (
          <>
            <div
              className="fixed inset-0 z-10"
              onClick={() => setProfileMenuOpen(false)}
            />
            <div className="absolute right-[43px] top-[140px] z-20 w-56 rounded-lg border border-slate-200 bg-white shadow-lg">
              <div className="p-3 border-b border-slate-100">
                <p className="text-sm font-medium text-slate-900">{user?.full_name}</p>
                <p className="text-xs text-slate-500">{user?.email}</p>
                <p className="mt-1 text-xs text-primary-600 capitalize">{user?.role}</p>
              </div>
              <div className="p-1">
                <button
                  onClick={() => {
                    setProfileMenuOpen(false);
                    router.push('/vendor/profile');
                  }}
                  className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
                >
                  Profile Settings
                </button>
                <button
                  onClick={() => {
                    setProfileMenuOpen(false);
                    signOut();
                  }}
                  className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-red-600 hover:bg-red-50"
                >
                  Sign Out
                </button>
              </div>
            </div>
          </>
        )}

        {/* Content */}
        <div className="mt-8">
          {/* Service Type Tabs (only for multi-service vendors) */}
          <ServiceTypeTabs
            services={vendorServices}
            activeService={activeService}
            onServiceChange={setActiveService}
          />

          {loading ? (
            <div className="space-y-6">
              <Skeleton className="h-12 w-64" />
              <div className="grid grid-cols-3 gap-6">
                <Skeleton className="h-[120px] rounded-[15px]" />
                <Skeleton className="h-[120px] rounded-[15px]" />
                <Skeleton className="h-[120px] rounded-[15px]" />
              </div>
              <Skeleton className="h-[400px] rounded-lg" />
            </div>
          ) : (
            <AnalyticsOverview serviceType={activeService} />
          )}
        </div>
      </div>
    </div>
  );
}
