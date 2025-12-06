'use client';

import { OnboardingStep5RentalsData, RENTALS_SERVICES, ItemizedPricing, WeeklyAvailability } from '@/types';
import { AvailabilitySchedule } from '@/components/vendor/AvailabilitySchedule';
import { Search, X, Plus } from 'lucide-react';
import { useState } from 'react';

interface Step5RentalsProps {
  data: OnboardingStep5RentalsData;
  onChange: (data: Partial<OnboardingStep5RentalsData>) => void;
}

// Figma-styled input component
function FigmaInput({
  label,
  placeholder,
  value,
  onChange,
  type = 'text',
}: {
  label: string;
  placeholder: string;
  value: string | number;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  type?: string;
}) {
  return (
    <div>
      <label
        className="block text-[15px] font-medium text-black/70 mb-2"
        style={{ fontFamily: "'Urbanist', sans-serif" }}
      >
        {label}
      </label>
      <input
        type={type}
        placeholder={placeholder}
        value={value || ''}
        onChange={onChange}
        className="
          w-full h-[50px] px-4
          bg-white border border-black/20 rounded-[10px]
          text-[16px] text-black/80 placeholder:text-black/40
          focus:outline-none focus:ring-2 focus:ring-[#65a4d8]/50
        "
        style={{ fontFamily: "'Manrope', sans-serif" }}
      />
    </div>
  );
}

// Figma-styled textarea
function FigmaTextarea({
  label,
  placeholder,
  value,
  onChange,
  rows = 4,
}: {
  label: string;
  placeholder: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  rows?: number;
}) {
  return (
    <div>
      <label
        className="block text-[15px] font-medium text-black/70 mb-2"
        style={{ fontFamily: "'Urbanist', sans-serif" }}
      >
        {label}
      </label>
      <textarea
        placeholder={placeholder}
        value={value || ''}
        onChange={onChange}
        rows={rows}
        className="
          w-full px-4 py-3
          bg-white border border-black/20 rounded-[10px]
          text-[16px] text-black/80 placeholder:text-black/40
          focus:outline-none focus:ring-2 focus:ring-[#65a4d8]/50
          resize-none
        "
        style={{ fontFamily: "'Manrope', sans-serif" }}
      />
    </div>
  );
}

export function Step5Rentals({ data, onChange }: Step5RentalsProps) {
  const [serviceSearch, setServiceSearch] = useState('');

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

  const filteredServices = RENTALS_SERVICES.filter((service) =>
    service.toLowerCase().includes(serviceSearch.toLowerCase())
  );

  return (
    <div className="relative min-h-[700px]">
      {/* Decorative gradient blurs */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[1200px] h-[300px] rounded-[150px] blur-sm opacity-30 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at center, rgba(221,233,243,0.5) 0%, rgba(221,233,243,0.3) 50%, rgba(221,233,243,0.05) 100%)',
        }}
      />
      <div
        className="absolute top-[200px] left-1/2 -translate-x-1/2 w-[1100px] h-[600px] rounded-[50px] blur-sm opacity-20 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at 20% 30%, rgba(210,211,239,0.35) 0%, rgba(210,211,239,0.2) 50%, rgba(210,211,239,0.3) 100%)',
        }}
      />

      <div className="relative z-10 space-y-6 pt-4">
        {/* Title */}
        <div className="text-center mb-8">
          <h1
            className="text-3xl md:text-4xl lg:text-[45px] font-semibold text-black"
            style={{ fontFamily: "'Poppins', sans-serif" }}
          >
            Rentals Information
          </h1>
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto px-4">
          {/* Left Column */}
          <div className="space-y-5">
            {/* Order Size */}
            <div>
              <label
                className="block text-[18px] font-medium text-black mb-3"
                style={{ fontFamily: "'Urbanist', sans-serif" }}
              >
                Order Size (number of items)
              </label>
              <div className="grid grid-cols-2 gap-4">
                <FigmaInput
                  label="Minimum"
                  placeholder="10"
                  type="number"
                  value={data.minOrderSize || ''}
                  onChange={(e) => onChange({ minOrderSize: parseInt(e.target.value) || 0 })}
                />
                <FigmaInput
                  label="Maximum"
                  placeholder="500"
                  type="number"
                  value={data.maxOrderSize || ''}
                  onChange={(e) => onChange({ maxOrderSize: parseInt(e.target.value) || 0 })}
                />
              </div>
            </div>

            {/* Short Description */}
            <FigmaTextarea
              label="Short Description"
              placeholder="Describe your rental services..."
              value={data.shortDescription}
              onChange={(e) => onChange({ shortDescription: e.target.value })}
              rows={3}
            />

            {/* Itemized Pricing Table */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <label
                  className="text-[18px] font-medium text-black"
                  style={{ fontFamily: "'Urbanist', sans-serif" }}
                >
                  Itemized Pricing
                </label>
                <button
                  type="button"
                  onClick={addPricingItem}
                  className="flex items-center gap-1 text-[14px] font-medium text-[#65a4d8] hover:text-[#4a8bc4]"
                  style={{ fontFamily: "'Inter', sans-serif" }}
                >
                  <Plus className="w-4 h-4" />
                  Add Item
                </button>
              </div>

              {(data.itemizedPricing || []).length > 0 ? (
                <div className="rounded-[12px] border border-black/10 overflow-hidden">
                  {/* Header Row */}
                  <div className="grid grid-cols-4 bg-[#f8f9fb] border-b border-black/10">
                    <div className="px-3 py-2">
                      <span
                        className="text-[12px] font-medium text-black/70"
                        style={{ fontFamily: "'Inter', sans-serif" }}
                      >
                        Item Type
                      </span>
                    </div>
                    <div className="px-3 py-2">
                      <span
                        className="text-[12px] font-medium text-black/70"
                        style={{ fontFamily: "'Inter', sans-serif" }}
                      >
                        Price/Item ($)
                      </span>
                    </div>
                    <div className="px-3 py-2">
                      <span
                        className="text-[12px] font-medium text-black/70"
                        style={{ fontFamily: "'Inter', sans-serif" }}
                      >
                        Max Qty
                      </span>
                    </div>
                    <div className="px-3 py-2"></div>
                  </div>

                  {/* Data Rows */}
                  {(data.itemizedPricing || []).map((item, index) => (
                    <div
                      key={index}
                      className="grid grid-cols-4 border-b border-black/5 last:border-b-0 bg-white"
                    >
                      <div className="px-2 py-2">
                        <input
                          type="text"
                          placeholder="e.g. Chair"
                          value={item.itemType}
                          onChange={(e) => updatePricingItem(index, 'itemType', e.target.value)}
                          className="w-full h-[36px] px-2 bg-white border border-black/15 rounded-[6px] text-[13px] text-black/80 focus:outline-none focus:ring-1 focus:ring-[#65a4d8]/50"
                          style={{ fontFamily: "'Inter', sans-serif" }}
                        />
                      </div>
                      <div className="px-2 py-2">
                        <input
                          type="number"
                          placeholder="5.00"
                          value={item.pricePerItem || ''}
                          onChange={(e) => updatePricingItem(index, 'pricePerItem', parseFloat(e.target.value) || 0)}
                          className="w-full h-[36px] px-2 bg-white border border-black/15 rounded-[6px] text-[13px] text-black/80 focus:outline-none focus:ring-1 focus:ring-[#65a4d8]/50"
                          style={{ fontFamily: "'Inter', sans-serif" }}
                        />
                      </div>
                      <div className="px-2 py-2">
                        <input
                          type="number"
                          placeholder="100"
                          value={item.maxQuantity || ''}
                          onChange={(e) => updatePricingItem(index, 'maxQuantity', parseInt(e.target.value) || 0)}
                          className="w-full h-[36px] px-2 bg-white border border-black/15 rounded-[6px] text-[13px] text-black/80 focus:outline-none focus:ring-1 focus:ring-[#65a4d8]/50"
                          style={{ fontFamily: "'Inter', sans-serif" }}
                        />
                      </div>
                      <div className="px-2 py-2 flex items-center justify-center">
                        <button
                          type="button"
                          onClick={() => removePricingItem(index)}
                          className="text-black/30 hover:text-red-500 transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div
                  className="rounded-[15px] p-6 text-center"
                  style={{
                    border: '3px dashed rgba(0,0,0,0.15)',
                    background: 'rgba(200,222,236,0.05)',
                  }}
                >
                  <p
                    className="text-[14px] text-black/40"
                    style={{ fontFamily: "'Inter', sans-serif" }}
                  >
                    No items added yet.
                  </p>
                  <button
                    type="button"
                    onClick={addPricingItem}
                    className="mt-2 text-[14px] font-medium text-[#65a4d8] hover:text-[#4a8bc4]"
                    style={{ fontFamily: "'Inter', sans-serif" }}
                  >
                    Add your first item
                  </button>
                </div>
              )}
            </div>

            {/* Photo Upload */}
            <div>
              <label
                className="block text-[18px] font-medium text-black mb-3"
                style={{ fontFamily: "'Urbanist', sans-serif" }}
              >
                Rental Item Photos
              </label>
              <div
                className="rounded-[15px] p-8 text-center"
                style={{
                  border: '3px dashed rgba(0,0,0,0.2)',
                  background: 'linear-gradient(135deg, rgba(200,222,236,0.1) 0%, rgba(210,211,239,0.1) 100%)',
                }}
              >
                <p
                  className="text-[16px] text-black/50"
                  style={{ fontFamily: "'Manrope', sans-serif" }}
                >
                  Upload Photos [PNG or JPEG]
                </p>
                <p
                  className="text-[12px] text-black/30 mt-1"
                  style={{ fontFamily: "'Inter', sans-serif" }}
                >
                  Photo upload will be available after registration
                </p>
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
              <label
                className="block text-[18px] font-medium text-black mb-3"
                style={{ fontFamily: "'Urbanist', sans-serif" }}
              >
                Services Offered
              </label>

              {/* Search Input */}
              <div className="relative mb-3">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-black/30" />
                <input
                  type="text"
                  placeholder="Search services..."
                  value={serviceSearch}
                  onChange={(e) => setServiceSearch(e.target.value)}
                  className="
                    w-full h-[40px] pl-10 pr-4
                    bg-white border border-black/15 rounded-[20px]
                    text-[14px] text-black/80 placeholder:text-black/40
                    focus:outline-none focus:ring-1 focus:ring-[#65a4d8]/50
                  "
                  style={{ fontFamily: "'Inter', sans-serif" }}
                />
              </div>

              {/* Service Pills */}
              <div className="flex flex-wrap gap-2">
                {filteredServices.map((service) => {
                  const isSelected = (data.servicesOffered || []).includes(service);
                  return (
                    <button
                      key={service}
                      type="button"
                      onClick={() => toggleService(service)}
                      className={`
                        px-4 py-2 rounded-[55px] text-[14px] font-normal transition-all
                        ${isSelected
                          ? 'bg-[#65a4d8]/20 text-[#65a4d8] border border-[#65a4d8]'
                          : 'bg-[rgba(200,222,236,0.15)] text-black/60 border border-black/20 hover:bg-[rgba(200,222,236,0.25)]'
                        }
                      `}
                      style={{ fontFamily: "'Inter', sans-serif" }}
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
    </div>
  );
}
