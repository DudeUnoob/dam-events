'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { PhotoUpload } from '@/components/vendor/PhotoUpload';
import { ArrowLeft, Package, Loader2 } from 'lucide-react';
import Link from 'next/link';

interface PackageFormData {
  name: string;
  description: string;
  priceMin: number;
  priceMax: number;
  capacity: number;
  venueName: string;
  venueAmenities: string[];
  cateringMenuOptions: string;
  cateringDietary: string[];
  entertainmentType: string;
  entertainmentEquipment: string;
  photos: string[];
  status: 'draft' | 'published';
}

export default function CreatePackagePage() {
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [packageId, setPackageId] = useState<string | null>(null);

  const [formData, setFormData] = useState<PackageFormData>({
    name: '',
    description: '',
    priceMin: 0,
    priceMax: 0,
    capacity: 0,
    venueName: '',
    venueAmenities: [],
    cateringMenuOptions: '',
    cateringDietary: [],
    entertainmentType: '',
    entertainmentEquipment: '',
    photos: [],
    status: 'published',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: parseFloat(value) || 0,
    }));
  };

  const handleCheckboxChange = (category: 'venueAmenities' | 'cateringDietary', value: string) => {
    setFormData((prev) => ({
      ...prev,
      [category]: prev[category].includes(value)
        ? prev[category].filter((item) => item !== value)
        : [...prev[category], value],
    }));
  };

  const handlePhotosUploaded = (urls: string[]) => {
    setFormData((prev) => ({
      ...prev,
      photos: urls,
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>, status: 'draft' | 'published') => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // First get vendor ID
      const userResponse = await fetch('/api/auth/user');
      const userData = await userResponse.json();

      if (!userData.data) {
        throw new Error('Please complete vendor onboarding first');
      }

      // Get vendor profile
      const vendorResponse = await fetch('/api/vendors');
      const vendorData = await vendorResponse.json();

      if (!vendorData.data) {
        setError('Please complete your vendor profile before creating packages');
        setLoading(false);
        return;
      }

      const vendorId = vendorData.data.id;

      // Prepare package data
      const packageData = {
        vendorId: vendorId,
        name: formData.name,
        description: formData.description,
        priceMin: formData.priceMin,
        priceMax: formData.priceMax,
        capacity: formData.capacity,
        venueDetails: formData.venueName
          ? {
              name: formData.venueName,
              capacity: formData.capacity,
              amenities: formData.venueAmenities,
            }
          : null,
        cateringDetails: formData.cateringMenuOptions
          ? {
              menuOptions: formData.cateringMenuOptions.split('\n').filter(Boolean),
              dietaryAccommodations: formData.cateringDietary,
            }
          : null,
        entertainmentDetails: formData.entertainmentType
          ? {
              type: formData.entertainmentType,
              equipment: formData.entertainmentEquipment.split('\n').filter(Boolean),
            }
          : null,
        status,
      };

      // Create package
      const response = await fetch('/api/packages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(packageData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error?.message || 'Failed to create package');
      }

      // Success! Redirect to packages list or dashboard
      router.push('/vendor/dashboard');
    } catch (err: any) {
      console.error('Error creating package:', err);
      setError(err.message || 'Failed to create package. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Back Button */}
        <Button variant="ghost" size="sm" className="mb-6" asChild>
          <Link href="/vendor/dashboard">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Link>
        </Button>

        <Card variant="elevated">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-primary-100 p-3">
                <Package className="h-6 w-6 text-primary-600" />
              </div>
              <div>
                <CardTitle>Create Event Package</CardTitle>
                <CardDescription>
                  Bundle your venue, catering, and entertainment into one package
                </CardDescription>
              </div>
            </div>
          </CardHeader>

          <CardContent>
            {error && (
              <div className="mb-6 rounded-lg bg-red-50 border border-red-200 p-4 text-sm text-red-800">
                {error}
              </div>
            )}

            <form onSubmit={(e) => handleSubmit(e, 'published')} className="space-y-8">
              {/* Basic Information */}
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-slate-900">Basic Information</h3>

                <Input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  label="Package Name"
                  placeholder="e.g., Premium Social Package"
                  required
                />

                <Textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  label="Package Description"
                  placeholder="Describe what makes this package special..."
                  rows={4}
                  required
                />

                <div className="grid gap-6 sm:grid-cols-2">
                  <Input
                    type="number"
                    name="priceMin"
                    value={formData.priceMin || ''}
                    onChange={handleNumberChange}
                    label="Minimum Price ($)"
                    placeholder="4000"
                    min="0"
                    step="100"
                    required
                  />

                  <Input
                    type="number"
                    name="priceMax"
                    value={formData.priceMax || ''}
                    onChange={handleNumberChange}
                    label="Maximum Price ($)"
                    placeholder="6000"
                    min="0"
                    step="100"
                    required
                  />
                </div>

                <Input
                  type="number"
                  name="capacity"
                  value={formData.capacity || ''}
                  onChange={handleNumberChange}
                  label="Maximum Capacity"
                  placeholder="200"
                  min="1"
                  required
                />
              </div>

              {/* Venue Details */}
              <div className="space-y-6 border-t border-slate-200 pt-6">
                <h3 className="text-lg font-semibold text-slate-900">Venue Details</h3>

                <Input
                  type="text"
                  name="venueName"
                  value={formData.venueName}
                  onChange={handleChange}
                  label="Venue Name"
                  placeholder="Grand Ballroom"
                />

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Amenities
                  </label>
                  <div className="space-y-2">
                    {['Stage', 'Dance Floor', 'Audio System', 'Parking', 'Bar Area', 'Kitchen'].map((amenity) => (
                      <label key={amenity} className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={formData.venueAmenities.includes(amenity)}
                          onChange={() => handleCheckboxChange('venueAmenities', amenity)}
                          className="h-4 w-4 rounded border-slate-300 text-primary-600 focus:ring-primary-500"
                        />
                        <span className="text-sm text-slate-700">{amenity}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              {/* Catering Details */}
              <div className="space-y-6 border-t border-slate-200 pt-6">
                <h3 className="text-lg font-semibold text-slate-900">Catering Details (Optional)</h3>

                <Textarea
                  name="cateringMenuOptions"
                  value={formData.cateringMenuOptions}
                  onChange={handleChange}
                  label="Menu Options"
                  placeholder="Describe available menu options (one per line)&#10;e.g., Buffet Style&#10;Plated Dinner&#10;Appetizers & Hors d'oeuvres"
                  rows={4}
                />

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Dietary Accommodations
                  </label>
                  <div className="space-y-2">
                    {['Vegetarian', 'Vegan', 'Gluten-Free', 'Halal', 'Kosher'].map((diet) => (
                      <label key={diet} className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={formData.cateringDietary.includes(diet)}
                          onChange={() => handleCheckboxChange('cateringDietary', diet)}
                          className="h-4 w-4 rounded border-slate-300 text-primary-600 focus:ring-primary-500"
                        />
                        <span className="text-sm text-slate-700">{diet}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              {/* Entertainment Details */}
              <div className="space-y-6 border-t border-slate-200 pt-6">
                <h3 className="text-lg font-semibold text-slate-900">
                  Entertainment Details (Optional)
                </h3>

                <Input
                  type="text"
                  name="entertainmentType"
                  value={formData.entertainmentType}
                  onChange={handleChange}
                  label="Entertainment Type"
                  placeholder="e.g., DJ, Live Band, None"
                />

                <Textarea
                  name="entertainmentEquipment"
                  value={formData.entertainmentEquipment}
                  onChange={handleChange}
                  label="Equipment Provided"
                  placeholder="List any entertainment equipment included (one per line)&#10;e.g., Sound System&#10;Lighting&#10;Microphones"
                  rows={3}
                />
              </div>

              {/* Photos */}
              <div className="space-y-6 border-t border-slate-200 pt-6">
                <div>
                  <h3 className="text-lg font-semibold text-slate-900">Package Photos</h3>
                  <p className="mt-1 text-sm text-slate-600">
                    Upload photos of your venue and setup (up to 15 images)
                  </p>
                </div>

                {packageId || formData.name ? (
                  <PhotoUpload
                    bucketName="package-photos"
                    folderId={packageId || formData.name.replace(/\s+/g, '-').toLowerCase()}
                    maxPhotos={15}
                    existingPhotos={formData.photos}
                    onUpload={handlePhotosUploaded}
                  />
                ) : (
                  <div className="rounded-lg border-2 border-dashed border-slate-300 p-8 text-center">
                    <p className="text-sm text-slate-600">
                      Please fill in the package name above to enable photo uploads
                    </p>
                  </div>
                )}
              </div>

              {/* Form Actions */}
              <div className="flex gap-4 border-t border-slate-200 pt-6">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={(e) => {
                    const form = e.currentTarget.closest('form');
                    if (form) {
                      handleSubmit(new Event('submit') as any, 'draft');
                    }
                  }}
                  disabled={loading}
                >
                  {loading ? 'Saving...' : 'Save as Draft'}
                </Button>
                <Button type="submit" className="flex-1" disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Publishing...
                    </>
                  ) : (
                    'Publish Package'
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
