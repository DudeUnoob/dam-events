import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Lead } from '@/types';
import { formatDate, formatCurrency, formatRelativeTime } from '@/lib/utils';
import { Calendar, Users, DollarSign, MapPin, Clock } from 'lucide-react';

interface LeadCardProps {
  lead: Lead;
}

export function LeadCard({ lead }: LeadCardProps) {
  const statusVariant = {
    new: 'danger' as const,
    viewed: 'info' as const,
    quoted: 'warning' as const,
    booked: 'success' as const,
    declined: 'default' as const,
    closed: 'default' as const,
  };

  return (
    <Card className="transition-all hover:shadow-md">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-semibold text-slate-900">
                {lead.event?.event_type || 'Event'}
              </h3>
              <Badge variant={statusVariant[lead.status]}>{lead.status}</Badge>
              {lead.status === 'new' && (
                <Badge variant="danger" className="animate-pulse">
                  New
                </Badge>
              )}
            </div>

            {lead.event && (
              <div className="mt-4 space-y-2">
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <Calendar className="h-4 w-4" />
                  <span>{formatDate(lead.event.event_date)}</span>
                </div>

                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <Users className="h-4 w-4" />
                  <span>{lead.event.guest_count} guests</span>
                </div>

                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <DollarSign className="h-4 w-4" />
                  <span>{formatCurrency(lead.event.budget)} budget</span>
                </div>

                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <MapPin className="h-4 w-4" />
                  <span className="line-clamp-1">{lead.event.location_address}</span>
                </div>

                <div className="flex items-center gap-2 text-sm text-slate-500">
                  <Clock className="h-4 w-4" />
                  <span>Received {formatRelativeTime(lead.created_at)}</span>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="mt-6 flex gap-3">
          <Button variant="outline" size="sm" className="flex-1" asChild>
            <Link href={`/vendor/leads/${lead.id}`}>
              {lead.status === 'new' ? 'View Lead' : 'View Details'}
            </Link>
          </Button>
          {lead.status === 'new' && (
            <Button size="sm" className="flex-1" asChild>
              <Link href={`/vendor/leads/${lead.id}`}>Respond</Link>
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
