'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { PhotoUpload } from '@/components/vendor/PhotoUpload';
import { Skeleton } from '@/components/ui/Skeleton';
import { ErrorState } from '@/components/shared/ErrorState';
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

export default function EditPackagePage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const packageId = params.id as string;

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

  // Fetch existing package data
  useEffect(() => {
    const fetchPackage = async () => {
      try {
        const response = await fetch(`/api/packages/${packageId}`);
        const data = await response.json();

        if (!response.ok || !data.data) {
          throw new Error(data.error?.message || 'Package not found');
        }

        const pkg = data.data;

        // Convert database format to form format
        setFormData({
          name: pkg.name || '',
          description: pkg.description || '',
          priceMin: pkg.price_min || 0,
          priceMax: pkg.price_max || 0,
          capacity: pkg.capacity || 0,
          venueName: pkg.venue_details?.name || '',
          venueAmenities: pkg.venue_details?.amenities || [],
          cateringMenuOptions: pkg.catering_details?.menu_options?.join('\n') || '',
          cateringDietary: pkg.catering_details?.dietary_accommodations || [],
          entertainmentType: pkg.entertainment_details?.type || '',
          entertainmentEquipment: pkg.entertainment_details?.equipment?.join('\n') || '',
          photos: pkg.photos || [],
          status: pkg.status || 'draft',
        });
      } catch (err: any) {
        console.error('Error fetching package:', err);
        setError(err.message || 'Failed to load package');
      } finally {
        setLoading(false);
      }
    };

    if (packageId) {
      fetchPackage();
    }
  }, [packageId]);

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

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>, status?: 'draft' | 'published') => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      // Prepare package data
      const packageData = {
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
        status: status || formData.status,
      };

      // Update package
      const response = await fetch(`/api/packages/${packageId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(packageData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error?.message || 'Failed to update package');
      }

      // Success! Redirect to packages list
      router.push('/vendor/packages');
    } catch (err: any) {
      console.error('Error updating package:', err);
      setError(err.message || 'Failed to update package. Please try again.');
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

  if (error && !formData.name) {
    return (
      <div className="min-h-screen bg-slate-50 py-8">
        <div className="mx-auto max-w-4xl px-4">
          <ErrorState
            title="Failed to load package"
            message={error}
          />
          <div className="mt-4">
            <Button variant="outline" asChild>
              <Link href="/vendor/packages">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Packages
              </Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Back Button */}
        <Button variant="ghost" size="sm" className="mb-6" asChild>
          <Link href="/vendor/packages">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Packages
          </Link>
        </Button>

        <Card variant="elevated">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-primary-100 p-3">
                <Package className="h-6 w-6 text-primary-600" />
              </div>
              <div>
                <CardTitle>Edit Event Package</CardTitle>
                <CardDescription>
                  Update your package details and pricing
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

            <form onSubmit={(e) => handleSubmit(e)} className="space-y-8">
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
                  placeholder="Describe available menu options (one per line)"
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
                  placeholder="List any entertainment equipment included (one per line)"
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

                <PhotoUpload
                  bucketName="package-photos"
                  folderId={packageId}
                  maxPhotos={15}
                  existingPhotos={formData.photos}
                  onUpload={handlePhotosUploaded}
                />
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
                      const submitEvent = new Event('submit', { bubbles: true, cancelable: true });
                      Object.defineProperty(submitEvent, 'target', { value: form, enumerable: true });
                      handleSubmit(submitEvent as any, 'draft');
                    }
                  }}
                  disabled={saving}
                >
                  {saving ? 'Saving...' : 'Save as Draft'}
                </Button>
                <Button
                  type="submit"
                  className="flex-1"
                  disabled={saving}
                  onClick={(e) => {
                    const form = e.currentTarget.closest('form');
                    if (form) {
                      const submitEvent = new Event('submit', { bubbles: true, cancelable: true });
                      Object.defineProperty(submitEvent, 'target', { value: form, enumerable: true });
                      handleSubmit(submitEvent as any, 'published');
                    }
                  }}
                >
                  {saving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    'Save & Publish'
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
