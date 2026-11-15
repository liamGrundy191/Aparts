import type { ReactNode } from 'react';
import { MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { ImagePlaceholder } from './ImagePlaceholder';

export interface PropertyCardProps {
  /** Where the card links to, e.g. `/manager/properties/${id}` or `/tenant/leases/${id}` */
  to: string;
  name: string;
  address: string;
  city: string;
  /** The small line under the address, e.g. "4 units" or "Unit 3A · $5,200.00/mo" */
  footer: ReactNode;
}

export function PropertyCard({ to, name, address, city, footer }: PropertyCardProps) {
  return (
    <Link
      to={to}
      className="block rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <Card className="pt-0 transition-shadow hover:shadow-md">
        <ImagePlaceholder name={name} />
        <CardContent className="flex flex-col gap-1">
          <CardTitle>{name}</CardTitle>
          <CardDescription className="flex items-center gap-1">
            <MapPin className="size-3.5 shrink-0" aria-hidden />
            <span className="truncate">
              {address}, {city}
            </span>
          </CardDescription>
          <p className="mt-2 text-xs text-muted-foreground">{footer}</p>
        </CardContent>
      </Card>
    </Link>
  );
}

export function PropertyCardSkeleton() {
  return (
    <Card className="pt-0" aria-hidden>
      <Skeleton className="aspect-video w-full rounded-none" />
      <CardContent className="flex flex-col gap-2">
        <Skeleton className="h-4 w-2/3" />
        <Skeleton className="h-3 w-full" />
        <Skeleton className="mt-2 h-3 w-1/4" />
      </CardContent>
    </Card>
  );
}
