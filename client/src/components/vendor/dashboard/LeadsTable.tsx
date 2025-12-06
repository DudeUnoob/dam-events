'use client';

import { Lead, ServiceType } from '@/types';
import { LeadsTableRow } from './LeadsTableRow';

interface LeadsTableProps {
  leads: Lead[];
  serviceType: ServiceType;
}

// Get the service-specific column header
const getServiceColumnHeader = (serviceType: ServiceType): string | null => {
  switch (serviceType) {
    case 'catering':
      return 'Catering Type';
    case 'entertainment':
      return 'Entertainment Type';
    case 'rentals':
      return 'Item(s) Requested';
    case 'venue':
    default:
      return null; // Venue doesn't have a service-specific column
  }
};

export function LeadsTable({ leads, serviceType }: LeadsTableProps) {
  const serviceColumnHeader = getServiceColumnHeader(serviceType);
  const hasServiceColumn = serviceColumnHeader !== null;

  return (
    <div className="w-full">
      {/* Table Header */}
      <div
        className="
          bg-[rgba(235,255,215,0.3)]
          border border-[rgba(0,0,0,0.2)]
          rounded-[20px]
          px-6 py-4
          mb-4
        "
      >
        <div className={`grid ${hasServiceColumn ? 'grid-cols-6' : 'grid-cols-5'} gap-4 items-center`}>
          <div className="text-2xl font-medium text-black font-inter">
            Client
          </div>
          <div className="text-2xl font-medium text-black font-inter">
            Event Type
          </div>
          {hasServiceColumn && (
            <div className="text-2xl font-medium text-black font-inter">
              {serviceColumnHeader}
            </div>
          )}
          <div className="text-2xl font-medium text-black font-inter">
            Date of Inquiry
          </div>
          <div className="text-2xl font-medium text-black font-inter">
            Status
          </div>
          <div className="text-2xl font-medium text-black font-inter">
            Actions
          </div>
        </div>
      </div>

      {/* Table Body */}
      <div className="space-y-2">
        {leads.length > 0 ? (
          leads.map((lead) => (
            <LeadsTableRow
              key={lead.id}
              lead={lead}
              serviceType={serviceType}
              hasServiceColumn={hasServiceColumn}
            />
          ))
        ) : (
          <div className="text-center py-12 text-slate-500">
            No leads found for this service type.
          </div>
        )}
      </div>
    </div>
  );
}
