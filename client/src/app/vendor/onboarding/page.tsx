'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/Toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Building2, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';

const SERVICES = [
  { value: 'venue', label: 'Venue' },
  { value: 'catering', label: 'Catering' },
  { value: 'entertainment', label: 'Entertainment' },
];

export default function VendorOnboardingPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    businessName: '',
    description: '',
    services: [] as string[],
    locationAddress: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError(null);
  };

  const handleServiceToggle = (service: string) => {
    setFormData(prev => ({
      ...prev,
      services: prev.services.includes(service)
        ? prev.services.filter(s => s !== service)
        : [...prev.services, service],
    }));
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (!formData.businessName.trim()) {
      setError('Business name is required');
      return;
    }

    if (!formData.description.trim()) {
      setError('Description is required');
      return;
    }

    if (formData.services.length === 0) {
      setError('Please select at least one service');
      return;
    }

    if (!formData.locationAddress.trim()) {
      setError('Location is required');
      return;
    }

    try {
      setLoading(true);

      const response = await fetch('/api/vendors', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          businessName: formData.businessName.trim(),
          description: formData.description.trim(),
          services: formData.services,
          locationAddress: formData.locationAddress.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok || data.error) {
        throw new Error(data.error?.message || 'Failed to create vendor profile');
      }

      showToast('Vendor profile created successfully!', 'success');
      router.push('/vendor/profile');
    } catch (err: any) {
      console.error('Error creating vendor profile:', err);
      setError(err.message || 'Failed to create profile. Please try again.');
      showToast(err.message || 'Failed to create profile', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-12">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary-100 mb-4">
            <Building2 className="h-8 w-8 text-primary-600" />
          </div>
          <h1 className="text-3xl font-bold text-slate-900">Welcome to DAM Events!</h1>
          <p className="mt-2 text-lg text-slate-600">
            Let's set up your vendor profile to start receiving event leads
          </p>
        </div>

        <Card variant="elevated">
          <CardHeader>
            <CardTitle>Vendor Profile Setup</CardTitle>
            <CardDescription>
              Tell event planners about your business and the services you offer
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Error Message */}
              {error && (
                <div className="rounded-lg bg-red-50 border border-red-200 p-3 flex items-start gap-2">
                  <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-red-800">{error}</p>
                </div>
              )}

              {/* Business Name */}
              <Input
                label="Business Name"
                name="businessName"
                value={formData.businessName}
                onChange={handleChange}
                placeholder="e.g., Elite Events Venue"
                required
                helperText="Your business name as you want it displayed to planners"
              />

              {/* Description */}
              <Textarea
                label="Business Description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={4}
                placeholder="Describe your venue, services, what makes you unique..."
                required
                helperText="Max 500 characters"
                maxLength={500}
              />

              {/* Services */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-3">
                  Services You Offer *
                </label>
                <div className="space-y-2">
                  {SERVICES.map(service => (
                    <label
                      key={service.value}
                      className="flex items-center gap-3 p-3 rounded-lg border-2 border-slate-200 cursor-pointer hover:border-primary-300 transition-colors"
                    >
                      <input
                        type="checkbox"
                        checked={formData.services.includes(service.value)}
                        onChange={() => handleServiceToggle(service.value)}
                        className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-slate-300 rounded"
                      />
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-slate-900">{service.label}</span>
                        {formData.services.includes(service.value) && (
                          <CheckCircle2 className="h-4 w-4 text-green-600" />
                        )}
                      </div>
                    </label>
                  ))}
                </div>
                <p className="mt-2 text-xs text-slate-500">
                  Select all services that your business provides
                </p>
              </div>

              {/* Location */}
              <Input
                label="Business Location"
                name="locationAddress"
                value={formData.locationAddress}
                onChange={handleChange}
                placeholder="e.g., 123 Main St, Austin, TX"
                required
                helperText="Your venue address or general business location"
              />

              {/* Info Box */}
              <div className="rounded-lg bg-blue-50 border border-blue-200 p-4">
                <h3 className="text-sm font-medium text-blue-900 mb-2">What happens next?</h3>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Your profile will be reviewed by our team</li>
                  <li>• Once approved, you can create event packages</li>
                  <li>• Start receiving qualified event leads from planners</li>
                  <li>• Communicate with planners through our messaging system</li>
                </ul>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full"
                size="lg"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Creating Profile...
                  </>
                ) : (
                  'Create Vendor Profile'
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Support */}
        <div className="mt-6 text-center">
          <p className="text-sm text-slate-600">
            Need help?{' '}
            <a href="#" className="font-medium text-primary-600 hover:text-primary-700">
              Contact Support
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
