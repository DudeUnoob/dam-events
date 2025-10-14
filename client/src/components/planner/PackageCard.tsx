import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Package } from '@/types';
import { formatCurrency } from '@/lib/utils';
import { MapPin, Users, Utensils, Music, Building2 } from 'lucide-react';

interface PackageCardProps {
  package: Package;
  onRequestQuote?: (packageId: string) => void;
}

export function PackageCard({ package: pkg, onRequestQuote }: PackageCardProps) {
  return (
    <Card className="overflow-hidden transition-all hover:shadow-lg">
      {/* Image */}
      <div className="relative h-48 w-full bg-gradient-to-br from-slate-200 to-slate-300">
        {pkg.photos && pkg.photos.length > 0 ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={pkg.photos[0]}
            alt={pkg.name}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <Building2 className="h-16 w-16 text-slate-400" />
          </div>
        )}
        {pkg.distance && (
          <Badge
            variant="default"
            className="absolute right-4 top-4 bg-white/90 text-slate-900"
          >
            {pkg.distance.toFixed(1)} mi away
          </Badge>
        )}
      </div>

      <CardContent className="p-6">
        {/* Vendor Name */}
        {pkg.vendor && (
          <p className="text-sm font-medium text-primary-600">{pkg.vendor.business_name}</p>
        )}

        {/* Package Name */}
        <h3 className="mt-1 text-lg font-semibold text-slate-900">{pkg.name}</h3>

        {/* Description */}
        <p className="mt-2 line-clamp-2 text-sm text-slate-600">{pkg.description}</p>

        {/* Details */}
        <div className="mt-4 space-y-2">
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <Users className="h-4 w-4" />
            <span>Up to {pkg.capacity} guests</span>
          </div>

          {pkg.venue_details && (
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <Building2 className="h-4 w-4" />
              <span>{pkg.venue_details.name}</span>
            </div>
          )}

          {pkg.catering_details && (
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <Utensils className="h-4 w-4" />
              <span>Catering included</span>
            </div>
          )}

          {pkg.entertainment_details && (
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <Music className="h-4 w-4" />
              <span>{pkg.entertainment_details.type}</span>
            </div>
          )}
        </div>

        {/* Price */}
        <div className="mt-4 border-t border-slate-200 pt-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600">Price Range</p>
              <p className="text-xl font-bold text-slate-900">
                {formatCurrency(pkg.price_min)} - {formatCurrency(pkg.price_max)}
              </p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-6 flex gap-3">
          <Button variant="outline" size="sm" className="flex-1" asChild>
            <Link href={`/planner/packages/${pkg.id}`}>View Details</Link>
          </Button>
          {onRequestQuote && (
            <Button
              size="sm"
              className="flex-1"
              onClick={() => onRequestQuote(pkg.id)}
            >
              Request Quote
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
