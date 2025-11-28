'use client';

import { OnboardingStep5RentalsData, RENTALS_SERVICES, ItemizedPricing, WeeklyAvailability } from '@/types';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { AvailabilitySchedule } from '@/components/vendor/AvailabilitySchedule';
import { cn } from '@/lib/utils';

interface Step5RentalsProps {
  data: OnboardingStep5RentalsData;
  onChange: (data: Partial<OnboardingStep5RentalsData>) => void;
}

export function Step5Rentals({ data, onChange }: Step5RentalsProps) {
  const toggleService = (service: string) => {
    const current = data.servicesOffered || [];
    const isSelected = current.includes(service);

    if (isSelected) {
      onChange({ servicesOffered: current.filter((s) => s !== service) });
    } else {
      onChange({ servicesOffered: [...current, service] });
    }
  };

  const updatePricingItem = (index: number, field: keyof ItemizedPricing, value: string | number) => {
    const currentPricing = data.itemizedPricing || [];
    const updated = [...currentPricing];
    updated[index] = {
      ...updated[index],
      [field]: value,
    };
    onChange({ itemizedPricing: updated });
  };

  const addPricingItem = () => {
    const currentPricing = data.itemizedPricing || [];
    onChange({
      itemizedPricing: [
        ...currentPricing,
        { itemType: '', pricePerItem: 0, maxQuantity: 0 },
      ],
    });
  };

  const removePricingItem = (index: number) => {
    const currentPricing = data.itemizedPricing || [];
    onChange({
      itemizedPricing: currentPricing.filter((_, i) => i !== index),
    });
  };

  return (
    <div className="space-y-8">
      {/* Title */}
      <div className="text-center">
        <h1 className="text-4xl font-semibold text-slate-900 mb-4">
          Rentals Information
        </h1>
        <p className="text-slate-600">
          Provide details about your rental services
        </p>
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column */}
        <div className="space-y-6">
          {/* Order Size */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-3">
              Order Size (number of items)
            </label>
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Minimum Order"
                type="number"
                placeholder="10"
                value={data.minOrderSize || ''}
                onChange={(e) => onChange({ minOrderSize: parseInt(e.target.value) || 0 })}
              />
              <Input
                label="Maximum Order"
                type="number"
                placeholder="500"
                value={data.maxOrderSize || ''}
                onChange={(e) => onChange({ maxOrderSize: parseInt(e.target.value) || 0 })}
              />
            </div>
          </div>

          {/* Short Description */}
          <Textarea
            label="Short Description"
            placeholder="Describe your rental services..."
            value={data.shortDescription}
            onChange={(e) => onChange({ shortDescription: e.target.value })}
            rows={4}
          />

          {/* Itemized Pricing Table */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="block text-sm font-medium text-slate-700">
                Itemized Pricing
              </label>
              <button
                type="button"
                onClick={addPricingItem}
                className="text-sm font-medium text-primary-600 hover:text-primary-700"
              >
                + Add Item
              </button>
            </div>

            {(data.itemizedPricing || []).length > 0 ? (
              <div className="overflow-hidden rounded-lg border border-slate-200">
                <table className="w-full">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-3 py-2 text-left text-xs font-semibold text-slate-700">
                        Item Type
                      </th>
                      <th className="px-3 py-2 text-left text-xs font-semibold text-slate-700">
                        Price/Item ($)
                      </th>
                      <th className="px-3 py-2 text-left text-xs font-semibold text-slate-700">
                        Max Qty
                      </th>
                      <th className="px-3 py-2 text-center text-xs font-semibold text-slate-700">

                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {(data.itemizedPricing || []).map((item, index) => (
                      <tr key={index} className="bg-white">
                        <td className="px-3 py-2">
                          <input
                            type="text"
                            placeholder="e.g. Folding Chair"
                            value={item.itemType}
                            onChange={(e) => updatePricingItem(index, 'itemType', e.target.value)}
                            className="w-full rounded border border-slate-300 px-2 py-1 text-sm focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
                          />
                        </td>
                        <td className="px-3 py-2">
                          <input
                            type="number"
                            placeholder="5.00"
                            value={item.pricePerItem || ''}
                            onChange={(e) => updatePricingItem(index, 'pricePerItem', parseFloat(e.target.value) || 0)}
                            className="w-full rounded border border-slate-300 px-2 py-1 text-sm focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
                          />
                        </td>
                        <td className="px-3 py-2">
                          <input
                            type="number"
                            placeholder="100"
                            value={item.maxQuantity || ''}
                            onChange={(e) => updatePricingItem(index, 'maxQuantity', parseInt(e.target.value) || 0)}
                            className="w-full rounded border border-slate-300 px-2 py-1 text-sm focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
                          />
                        </td>
                        <td className="px-3 py-2 text-center">
                          <button
                            type="button"
                            onClick={() => removePricingItem(index)}
                            className="text-slate-400 hover:text-red-500"
                          >
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="rounded-lg border-2 border-dashed border-slate-300 p-6 text-center">
                <p className="text-sm text-slate-500">No items added yet.</p>
                <button
                  type="button"
                  onClick={addPricingItem}
                  className="mt-2 text-sm font-medium text-primary-600 hover:text-primary-700"
                >
                  Add your first item
                </button>
              </div>
            )}
          </div>

          {/* Photo Upload Placeholder */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-3">
              Rental Item Photos
            </label>
            <div className="border-2 border-dashed border-slate-300 rounded-lg p-8 text-center">
              <p className="text-slate-500">Upload Photos [PNG or JPEG]</p>
              <p className="text-xs text-slate-400 mt-1">Photo upload will be available after registration</p>
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Availability */}
          <AvailabilitySchedule
            availability={data.availability}
            onChange={(availability: WeeklyAvailability) => onChange({ availability })}
          />

          {/* Services Offered */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-3">
              Services Offered
            </label>
            <div className="flex flex-wrap gap-2">
              {RENTALS_SERVICES.map((service) => {
                const isSelected = (data.servicesOffered || []).includes(service);
                return (
                  <button
                    key={service}
                    type="button"
                    onClick={() => toggleService(service)}
                    className={cn(
                      'px-3 py-1.5 rounded-full text-sm font-medium transition-all',
                      isSelected
                        ? 'bg-primary-100 text-primary-700 border-2 border-primary-300'
                        : 'bg-slate-100 text-slate-600 border-2 border-transparent hover:bg-slate-200'
                    )}
                  >
                    {service}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
