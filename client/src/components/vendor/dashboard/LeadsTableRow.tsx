'use client';

import Link from 'next/link';
import { Lead, ServiceType } from '@/types';
import { User, MoreVertical } from 'lucide-react';
import { useState } from 'react';

interface LeadsTableRowProps {
  lead: Lead;
  serviceType: ServiceType;
  hasServiceColumn: boolean;
}

// Format date for display (e.g., "September 8th, 2025")
const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  const day = date.getDate();
  const month = months[date.getMonth()];
  const year = date.getFullYear();

  // Add ordinal suffix
  const suffix = (day === 1 || day === 21 || day === 31) ? 'st' :
                 (day === 2 || day === 22) ? 'nd' :
                 (day === 3 || day === 23) ? 'rd' : 'th';

  return `${month} ${day}${suffix}, ${year}`;
};

// Get status display text
const getStatusDisplay = (status: string): string => {
  switch (status) {
    case 'new':
      return 'Unread Message';
    case 'viewed':
      return 'Viewed';
    case 'quoted':
      return 'Awaiting Approval';
    case 'booked':
      return 'Confirmed Booking';
    case 'declined':
      return 'Declined';
    case 'closed':
      return 'Closed';
    default:
      return status;
  }
};

// Get service-specific column value
const getServiceColumnValue = (lead: Lead, serviceType: ServiceType): string => {
  const pkg = lead.package || lead.packages;

  switch (serviceType) {
    case 'catering':
      // Get catering type from package details
      const cateringDetails = pkg?.catering_details;
      if (cateringDetails?.menu_options && cateringDetails.menu_options.length > 0) {
        return cateringDetails.menu_options[0];
      }
      return 'Custom Menu';

    case 'entertainment':
      // Get entertainment type from package details
      const entertainmentDetails = pkg?.entertainment_details;
      if (entertainmentDetails?.type) {
        return entertainmentDetails.type;
      }
      return 'Performance';

    case 'rentals':
      // Get items requested from package details
      const rentalDetails = pkg?.rental_details;
      if (rentalDetails?.items && rentalDetails.items.length > 0) {
        return rentalDetails.items.slice(0, 2).join(', ');
      }
      return 'Rental Items';

    default:
      return '';
  }
};

// Get client name from lead
const getClientName = (lead: Lead): string => {
  // Try to get from users (planner info)
  if (lead.users?.full_name) {
    return lead.users.full_name;
  }
  // Fallback to event info or generic
  return 'Client';
};

export function LeadsTableRow({ lead, serviceType, hasServiceColumn }: LeadsTableRowProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const event = lead.event || lead.events;
  const clientName = getClientName(lead);
  const eventType = event?.event_type || 'Event';
  const dateOfInquiry = formatDate(lead.created_at);
  const statusDisplay = getStatusDisplay(lead.status);
  const serviceColumnValue = hasServiceColumn ? getServiceColumnValue(lead, serviceType) : '';

  return (
    <div className={`grid ${hasServiceColumn ? 'grid-cols-6' : 'grid-cols-5'} gap-4 items-center px-6 py-4`}>
      {/* Client */}
      <div className="flex items-center gap-3">
        <div className="h-[43px] w-[49px] flex items-center justify-center">
          <User className="h-7 w-7 text-[#65a4d8]" strokeWidth={1.5} />
        </div>
        <span className="text-2xl font-normal text-black font-manrope">
          {clientName}
        </span>
      </div>

      {/* Event Type */}
      <div className="text-2xl font-normal text-black font-manrope">
        {eventType}
      </div>

      {/* Service-Specific Column */}
      {hasServiceColumn && (
        <div className="text-2xl font-normal text-black font-manrope">
          {serviceColumnValue}
        </div>
      )}

      {/* Date of Inquiry */}
      <div className="text-2xl font-normal text-black font-manrope">
        {dateOfInquiry}
      </div>

      {/* Status */}
      <div className="text-2xl font-normal text-black font-manrope">
        {statusDisplay}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        <Link
          href={`/vendor/leads/${lead.id}`}
          className="text-2xl font-normal text-[#6d9ec8] hover:underline font-manrope"
        >
          View
        </Link>
        <div className="relative">
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="p-1 hover:bg-slate-100 rounded-full transition-colors"
          >
            <MoreVertical className="h-6 w-6 text-slate-600" />
          </button>

          {menuOpen && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setMenuOpen(false)}
              />
              <div className="absolute right-0 top-8 z-20 w-48 bg-white rounded-lg shadow-lg border border-slate-200 py-1">
                <Link
                  href={`/vendor/leads/${lead.id}`}
                  className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
                  onClick={() => setMenuOpen(false)}
                >
                  View Details
                </Link>
                <Link
                  href={`/messages?lead=${lead.id}`}
                  className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
                  onClick={() => setMenuOpen(false)}
                >
                  Send Message
                </Link>
                {lead.status === 'new' && (
                  <button
                    className="block w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
                    onClick={() => setMenuOpen(false)}
                  >
                    Mark as Viewed
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
