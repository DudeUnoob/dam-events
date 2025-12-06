'use client';

import { Lead, ServiceType } from '@/types';
import { BookingCard } from './BookingCard';

interface BookingsViewProps {
  leads: Lead[];
  serviceType: ServiceType;
}

export function BookingsView({ leads, serviceType }: BookingsViewProps) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Split leads into upcoming and past events
  const upcomingEvents = leads.filter((lead) => {
    const event = lead.event || lead.events;
    if (!event?.event_date) return false;
    const eventDate = new Date(event.event_date);
    return eventDate >= today;
  });

  const pastEvents = leads.filter((lead) => {
    const event = lead.event || lead.events;
    if (!event?.event_date) return false;
    const eventDate = new Date(event.event_date);
    return eventDate < today;
  });

  // Sort upcoming by date (nearest first)
  upcomingEvents.sort((a, b) => {
    const dateA = new Date((a.event || a.events)?.event_date || 0);
    const dateB = new Date((b.event || b.events)?.event_date || 0);
    return dateA.getTime() - dateB.getTime();
  });

  // Sort past by date (most recent first)
  pastEvents.sort((a, b) => {
    const dateA = new Date((a.event || a.events)?.event_date || 0);
    const dateB = new Date((b.event || b.events)?.event_date || 0);
    return dateB.getTime() - dateA.getTime();
  });

  return (
    <div className="space-y-12">
      {/* Upcoming Events Section */}
      <section>
        <div className="bg-[rgba(224,219,255,0.25)] rounded-[20px] p-8">
          <h2 className="text-3xl font-normal text-black font-poppins mb-6">
            Upcoming Events
          </h2>

          {upcomingEvents.length > 0 ? (
            <div className="space-y-4">
              {upcomingEvents.map((lead) => (
                <BookingCard
                  key={lead.id}
                  lead={lead}
                  serviceType={serviceType}
                  isPastEvent={false}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-slate-500">
              <p className="text-lg">No upcoming events</p>
              <p className="text-sm mt-2">
                Bookings will appear here once planners confirm their events.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Past Events Section */}
      <section>
        <div className="bg-[rgba(224,219,255,0.25)] rounded-[20px] p-8">
          <h2 className="text-3xl font-normal text-black font-poppins mb-6">
            Past Events
          </h2>

          {pastEvents.length > 0 ? (
            <div className="space-y-4">
              {pastEvents.map((lead) => (
                <BookingCard
                  key={lead.id}
                  lead={lead}
                  serviceType={serviceType}
                  isPastEvent={true}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-slate-500">
              <p className="text-lg">No past events</p>
              <p className="text-sm mt-2">
                Completed events will appear here for your records.
              </p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
