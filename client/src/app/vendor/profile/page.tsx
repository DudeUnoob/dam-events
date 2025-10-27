'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Skeleton';
import { PhotoUpload } from '@/components/vendor/PhotoUpload';
import { Building2, MapPin, Phone, Mail, CheckCircle, Loader2 } from 'lucide-react';

interface VendorProfile {
  id: string;
  business_name: string;
  description: string;
  location_address: string;
  services: string[];
  status: string;
  photo_urls?: string[];
}

export default function VendorProfilePage() {
  const { user } = useAuth();
  const [vendor, setVendor] = useState<VendorProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    businessName: '',
    description: '',
    locationAddress: '',
    services: [] as string[],
    photos: [] as string[],
  });

  // Fetch vendor profile
  useEffect(() => {
    const fetchVendor = async () => {
      try {
        // Get current vendor ID from user
        const response = await fetch('/api/vendors');
        const data = await response.json();

        if (response.ok && data.data) {
          setVendor(data.data);
          setFormData({
            businessName: data.data.business_name || '',
            description: data.data.description || '',
            locationAddress: data.data.location_address || '',
            services: data.data.services || [],
            photos: data.data.photo_urls || [],
          });
        } else {
          setError(data.error?.message || 'Failed to load profile');
        }
      } catch (err) {
        console.error('Error fetching vendor:', err);
        setError('Failed to load profile');
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchVendor();
    }
  }, [user]);

  const handleServiceToggle = (service: string) => {
    setFormData(prev => ({
      ...prev,
      services: prev.services.includes(service)
        ? prev.services.filter(s => s !== service)
        : [...prev.services, service],
    }));
  };

  const handlePhotosUploaded = (urls: string[]) => {
    setFormData(prev => ({
      ...prev,
      photos: urls,
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      if (!vendor) {
        throw new Error('Vendor profile not found');
      }

      const response = await fetch(`/api/vendors/${vendor.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          businessName: formData.businessName,
          description: formData.description,
          locationAddress: formData.locationAddress,
          services: formData.services,
          photoUrls: formData.photos,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error?.message || 'Failed to update profile');
      }

      setVendor(data.data);
      alert('Profile updated successfully!');
    } catch (err: any) {
      console.error('Error updating profile:', err);
      setError(err.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 py-8">
        <div className="mx-auto max-w-4xl px-4">
          <Skeleton className="h-96 w-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold text-slate-900">Business Profile</h1>
            <Badge variant="success" className="flex items-center gap-1">
              <CheckCircle className="h-3 w-3" />
              Verified
            </Badge>
          </div>
          <p className="mt-2 text-slate-600">
            Manage your business information and services
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Profile Form */}
          <Card variant="elevated" className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Business Information</CardTitle>
              <CardDescription>
                This information will be visible to event planners
              </CardDescription>
            </CardHeader>

            <CardContent>
              {error && (
                <div className="mb-6 rounded-lg bg-red-50 border border-red-200 p-4 text-sm text-red-800">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Business Name */}
                <Input
                  type="text"
                  label="Business Name"
                  placeholder="Elite Events Venue"
                  value={formData.businessName}
                  onChange={(e) => setFormData(prev => ({ ...prev, businessName: e.target.value }))}
                  required
                />

                {/* Email (Read-only) */}
                <div>
                  <Input
                    type="email"
                    label="Email"
                    value={user?.email || ''}
                    disabled
                  />
                  <p className="mt-1 text-xs text-slate-500">
                    Email cannot be changed. Contact support if needed.
                  </p>
                </div>

                {/* Location */}
                <div>
                  <Input
                    type="text"
                    label="Business Address"
                    placeholder="123 Main St, Austin, TX 78701"
                    value={formData.locationAddress}
                    onChange={(e) => setFormData(prev => ({ ...prev, locationAddress: e.target.value }))}
                    required
                  />
                  <p className="mt-1 text-xs text-slate-500">
                    We use this to calculate distance for planners
                  </p>
                </div>

                {/* Description */}
                <Textarea
                  label="Business Description"
                  placeholder="Tell planners about your venue and services..."
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  rows={4}
                  required
                />

                {/* Services */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Services Offered
                  </label>
                  <div className="space-y-2">
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={formData.services.includes('venue')}
                        onChange={() => handleServiceToggle('venue')}
                        className="h-4 w-4 rounded border-slate-300 text-primary-600 focus:ring-primary-500"
                      />
                      <span className="text-sm text-slate-700">Venue</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={formData.services.includes('catering')}
                        onChange={() => handleServiceToggle('catering')}
                        className="h-4 w-4 rounded border-slate-300 text-primary-600 focus:ring-primary-500"
                      />
                      <span className="text-sm text-slate-700">Catering</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={formData.services.includes('entertainment')}
                        onChange={() => handleServiceToggle('entertainment')}
                        className="h-4 w-4 rounded border-slate-300 text-primary-600 focus:ring-primary-500"
                      />
                      <span className="text-sm text-slate-700">Entertainment</span>
                    </label>
                  </div>
                </div>

                {/* Business Photos */}
                <div className="border-t border-slate-200 pt-6">
                  <div className="mb-4">
                    <h3 className="text-lg font-semibold text-slate-900">Business Photos</h3>
                    <p className="mt-1 text-sm text-slate-600">
                      Upload photos of your venue, space, and services (up to 10 images)
                    </p>
                  </div>

                  {vendor && (
                    <PhotoUpload
                      bucketName="vendor-photos"
                      folderId={vendor.id}
                      maxPhotos={10}
                      existingPhotos={formData.photos}
                      onUpload={handlePhotosUploaded}
                    />
                  )}
                </div>

                {/* Form Actions */}
                <div className="flex gap-4 border-t border-slate-200 pt-6">
                  <Button type="submit" disabled={saving}>
                    {saving ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      'Save Changes'
                    )}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      if (vendor) {
                        setFormData({
                          businessName: vendor.business_name,
                          description: vendor.description,
                          locationAddress: vendor.location_address,
                          services: vendor.services,
                          photos: vendor.photo_urls || [],
                        });
                      }
                    }}
                  >
                    Reset
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Profile Summary */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="rounded-lg bg-primary-100 p-3">
                    <Building2 className="h-6 w-6 text-primary-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900">{vendor?.business_name || 'Your Business'}</h3>
                    <Badge variant={vendor?.status === 'verified' ? 'success' : vendor?.status === 'pending' ? 'warning' : 'default'} className="mt-1">
                      {vendor?.status === 'verified' ? (
                        <>
                          <CheckCircle className="mr-1 h-3 w-3" />
                          Verified
                        </>
                      ) : vendor?.status === 'pending' ? (
                        'Pending Review'
                      ) : (
                        vendor?.status || 'Draft'
                      )}
                    </Badge>
                  </div>
                </div>

                <div className="space-y-3">
                  {vendor?.location_address && (
                    <div className="flex items-start gap-2 text-sm text-slate-600">
                      <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0" />
                      <span>{vendor.location_address}</span>
                    </div>
                  )}
                  <div className="flex items-start gap-2 text-sm text-slate-600">
                    <Mail className="h-4 w-4 mt-0.5 flex-shrink-0" />
                    <span>{user?.email}</span>
                  </div>
                  {vendor?.services && vendor.services.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-3">
                      {vendor.services.map(service => (
                        <Badge key={service} variant="default" className="text-xs">
                          {service}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Tips */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Profile Tips</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-slate-600">
                <p>✓ Add high-quality photos to attract more planners</p>
                <p>✓ Keep your description detailed and engaging</p>
                <p>✓ Update your services to match what you offer</p>
                <p>✓ Respond quickly to leads for better visibility</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
