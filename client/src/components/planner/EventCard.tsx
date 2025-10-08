import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Event } from '@/types';
import { formatDate, formatCurrency } from '@/lib/utils';
import { Calendar, Users, MapPin, DollarSign } from 'lucide-react';

interface EventCardProps {
  event: Event;
}

export function EventCard({ event }: EventCardProps) {
  const statusVariant = {
    draft: 'default' as const,
    active: 'info' as const,
    booked: 'success' as const,
    closed: 'default' as const,
  };

  return (
    <Card className="transition-all hover:shadow-md">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-semibold text-slate-900">{event.event_type}</h3>
              <Badge variant={statusVariant[event.status]}>{event.status}</Badge>
            </div>

            <div className="mt-4 space-y-2">
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <Calendar className="h-4 w-4" />
                <span>{formatDate(event.event_date)}</span>
              </div>

              <div className="flex items-center gap-2 text-sm text-slate-600">
                <Users className="h-4 w-4" />
                <span>{event.guest_count} guests</span>
              </div>

              <div className="flex items-center gap-2 text-sm text-slate-600">
                <DollarSign className="h-4 w-4" />
                <span>{formatCurrency(event.budget)} budget</span>
              </div>

              <div className="flex items-center gap-2 text-sm text-slate-600">
                <MapPin className="h-4 w-4" />
                <span className="line-clamp-1">{event.location_address}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 flex gap-3">
          <Button variant="outline" size="sm" className="flex-1" asChild>
            <Link href={`/planner/events/${event.id}`}>View Details</Link>
          </Button>
          {event.status === 'active' && (
            <Button size="sm" className="flex-1" asChild>
              <Link href="/planner/browse">Find Packages</Link>
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
