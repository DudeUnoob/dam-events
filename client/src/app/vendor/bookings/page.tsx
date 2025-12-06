'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { VendorDashboardTabs } from '@/components/vendor/dashboard/VendorDashboardTabs';
import { ServiceTypeTabs } from '@/components/vendor/dashboard/ServiceTypeTabs';
import { BookingsView } from '@/components/vendor/bookings/BookingsView';
import { Skeleton } from '@/components/ui/Skeleton';
import { ErrorState } from '@/components/shared/ErrorState';
import { Lead, Vendor, ServiceType } from '@/types';

export default function VendorBookings() {
  const { user, loading: authLoading, signOut } = useAuth();
  const router = useRouter();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [vendor, setVendor] = useState<Vendor | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeService, setActiveService] = useState<ServiceType>('venue');
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);

  // Fetch vendor profile to get services
  const fetchVendor = useCallback(async () => {
    if (!user) return;

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
    }
  }, [user]);

  // Fetch booked leads
  const fetchBookings = useCallback(async () => {
    if (!user) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/leads?role=vendor');
      const data = await response.json();

      if (response.ok && data.data) {
        // Filter for booked leads only
        const bookedLeads = data.data.filter(
          (lead: Lead) => lead.status === 'booked'
        );
        setLeads(bookedLeads);
      } else {
        setError(data.error?.message || 'Failed to fetch bookings');
      }
    } catch (err) {
      console.error('Error fetching bookings:', err);
      setError('Failed to load bookings. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user && !authLoading) {
      fetchVendor();
      fetchBookings();
    }
  }, [user, authLoading, fetchVendor, fetchBookings]);

  // Get vendor services (default to venue if not available)
  const vendorServices: ServiceType[] = vendor?.services?.length
    ? (vendor.services as ServiceType[])
    : ['venue'];

  // Filter leads by service type based on the package's service
  const getLeadServiceType = (lead: Lead): ServiceType | null => {
    const pkg = lead.package || lead.packages;
    if (!pkg) return null;

    // Determine service type from package details
    if (pkg.venue_details) return 'venue';
    if (pkg.catering_details) return 'catering';
    if (pkg.entertainment_details) return 'entertainment';
    if (pkg.rental_details) return 'rentals';

    return null;
  };

  // Filter leads by active service type
  const filteredLeads = vendorServices.length > 1
    ? leads.filter((lead) => {
        const leadService = getLeadServiceType(lead);
        return leadService === activeService || leadService === null;
      })
    : leads;

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
            <div className="space-y-8">
              <div className="bg-[rgba(224,219,255,0.25)] rounded-[20px] p-8">
                <Skeleton className="h-10 w-48 mb-6" />
                <Skeleton className="h-[200px] rounded-[15px]" />
              </div>
              <div className="bg-[rgba(224,219,255,0.25)] rounded-[20px] p-8">
                <Skeleton className="h-10 w-48 mb-6" />
                <Skeleton className="h-[200px] rounded-[15px]" />
              </div>
            </div>
          ) : error ? (
            <ErrorState
              title="Failed to load bookings"
              message={error}
              onRetry={fetchBookings}
            />
          ) : (
            <BookingsView
              leads={filteredLeads}
              serviceType={activeService}
            />
          )}
        </div>
      </div>
    </div>
  );
}
