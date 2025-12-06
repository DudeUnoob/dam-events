'use client';

import Link from 'next/link';
import { Lead, ServiceType } from '@/types';

interface BookingCardProps {
  lead: Lead;
  serviceType: ServiceType;
  isPastEvent?: boolean;
}

// Format date for display (e.g., "Tuesday, Oct. 4")
const formatEventDate = (dateString: string): string => {
  const date = new Date(dateString);
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  return `${days[date.getDay()]}, ${months[date.getMonth()]}. ${date.getDate()}`;
};

// Get notes label based on service type
const getNotesLabels = (serviceType: ServiceType): { primary: string; secondary?: string } => {
  switch (serviceType) {
    case 'venue':
      return { primary: 'Notes:' };
    case 'catering':
      return { primary: 'Menu Notes:', secondary: 'Setup Notes:' };
    case 'entertainment':
      return { primary: 'Performance Notes:', secondary: 'Setup Notes:' };
    case 'rentals':
      return { primary: 'Rental Details:', secondary: 'Setup Notes:' };
    default:
      return { primary: 'Notes:' };
  }
};

// Mock notes data (in real app, this would come from the lead/booking data)
const getMockNotes = (serviceType: ServiceType, isPastEvent: boolean): { primary: string; secondary?: string; feedback?: string } => {
  if (isPastEvent) {
    switch (serviceType) {
      case 'venue':
        return {
          primary: 'Requested video recap for post-event portfolio',
        };
      case 'catering':
        return {
          primary: 'Requested video recap for post-event portfolio',
        };
      case 'entertainment':
        return {
          primary: 'Required projector setup for opening act visuals.',
          feedback: '"Everything was perfect! Loved the performance."'
        };
      case 'rentals':
        return {
          primary: 'Included stage lighting, cocktail tables, and branded backdrops.',
          feedback: '"Setup looked amazing and delivery was right on time"'
        };
      default:
        return { primary: 'No notes available' };
    }
  }

  switch (serviceType) {
    case 'venue':
      return {
        primary: 'Client requested extra lighting set up.',
      };
    case 'catering':
      return {
        primary: 'Client requested gluten-free pasta option and extra servers.',
        secondary: 'Outdoor buffet setup with 3 chafing dishes.'
      };
    case 'entertainment':
      return {
        primary: 'First dance: "Can\'t Help Falling In Love" live version.',
        secondary: 'Setup 1 hour before reception begins.'
      };
    case 'rentals':
      return {
        primary: 'Tables, chairs, linens, and lighting package',
        secondary: 'Setup begins 1 hour before event start; stage area near dance floor'
      };
    default:
      return { primary: 'No notes available' };
  }
};

// Get client name from lead
const getClientName = (lead: Lead): string => {
  if (lead.users?.full_name) {
    return lead.users.full_name;
  }
  return 'Client';
};

export function BookingCard({ lead, serviceType, isPastEvent = false }: BookingCardProps) {
  const event = lead.event || lead.events;
  const clientName = getClientName(lead);
  const eventType = event?.event_type || 'Event';
  const guestCount = event?.guest_count || 0;
  const eventDate = event?.event_date ? formatEventDate(event.event_date) : 'TBD';
  const notesLabels = getNotesLabels(serviceType);
  const notes = getMockNotes(serviceType, isPastEvent);

  // Mock time range
  const timeRange = isPastEvent ? '7 PM - 10 PM' : '6 PM - 12 AM';

  // Generate event title
  const eventTitle = `${clientName.split(' ')[0]} ${eventType}`;

  return (
    <div className="bg-[rgba(224,219,255,0.15)] border border-[rgba(0,0,0,0.1)] rounded-[15px] p-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Event Details */}
        <div className="space-y-2">
          <h4 className="text-xl font-semibold text-black font-poppins">
            {eventTitle}
          </h4>
          <p className="text-base text-black font-manrope">
            {guestCount} Guests
          </p>
          {isPastEvent && serviceType === 'entertainment' && (
            <p className="text-base text-black font-manrope">
              Live Performance
            </p>
          )}
          {isPastEvent && serviceType === 'rentals' && (
            <p className="text-base text-black font-manrope">
              Furniture & Decor Package
            </p>
          )}
          <p className="text-base text-black font-manrope">
            {eventDate}
          </p>
          <p className="text-base text-black font-manrope">
            {timeRange}
          </p>
        </div>

        {/* Notes Section */}
        <div className="space-y-3">
          {isPastEvent && notes.feedback ? (
            <>
              <div>
                <p className="text-base font-medium text-black font-inter">
                  Event Notes:
                </p>
                <p className="text-base text-slate-700 font-manrope">
                  {notes.primary}
                </p>
              </div>
              <div>
                <p className="text-base font-medium text-black font-inter">
                  Feedback:
                </p>
                <p className="text-base text-slate-700 font-manrope italic">
                  {notes.feedback}
                </p>
              </div>
            </>
          ) : (
            <>
              <div>
                <p className="text-base font-medium text-black font-inter">
                  {notesLabels.primary}
                </p>
                <p className="text-base text-slate-700 font-manrope">
                  {notes.primary}
                </p>
              </div>
              {notesLabels.secondary && notes.secondary && (
                <div>
                  <p className="text-base font-medium text-black font-inter">
                    {notesLabels.secondary}
                  </p>
                  <p className="text-base text-slate-700 font-manrope">
                    {notes.secondary}
                  </p>
                </div>
              )}
            </>
          )}
        </div>

        {/* Contact Planner Section */}
        <div className="space-y-3">
          <p className="text-base font-medium text-black font-inter">
            Contact Planner:
          </p>
          <p className="text-base text-black font-manrope">
            {clientName}
          </p>
          <div className="flex flex-col gap-2">
            <Link
              href={`/messages?lead=${lead.id}`}
              className="
                inline-block px-6 py-2 rounded-lg text-center
                bg-[rgba(235,255,215,0.5)] border border-[rgba(0,0,0,0.2)]
                text-black font-medium text-sm
                hover:bg-[rgba(235,255,215,0.8)] transition-colors
              "
            >
              Message
            </Link>
            {serviceType === 'catering' && !isPastEvent && (
              <button
                className="
                  px-6 py-2 rounded-lg text-center
                  bg-white border border-[rgba(0,0,0,0.2)]
                  text-black font-medium text-sm
                  hover:bg-slate-50 transition-colors
                "
              >
                Send Menu Update
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
