import { UnitStatus, type PropertyWithUnits } from '@aparts/shared';
import { MapPin } from 'lucide-react';
import { Card, CardContent, CardDescription, CardTitle } from './ui/card';
import { ImagePlaceholder } from './ImagePlaceholder';
import { Skeleton } from '@/components/ui/skeleton';

export function PropertyDetailsSkeleton() {
  return (
    <Card className="pt-0">
      <Skeleton className="aspect-[4/1] w-full rounded-none" />
      <CardContent className="flex flex-col gap-3">
        <div className="flex flex-col gap-2">
          <Skeleton className="h-7 w-1/3" />
          <Skeleton className="h-4 w-1/2" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-6 w-16" />
          <Skeleton className="h-6 w-24" />
          <Skeleton className="h-6 w-20" />
        </div>
      </CardContent>
    </Card>
  );
}

interface props {
  property: PropertyWithUnits;
}

export default function PropertyDetails({ property }: props) {
  const { address, city, name, units, notes } = property;
  const occupied = units.filter((u) => u.status === UnitStatus.OCCUPIED).length;

  return (
    <Card className="pt-0">
      <ImagePlaceholder name={name} className="aspect-[4/1]" />
      <CardContent className="flex flex-col gap-3">
        <div className="flex flex-col gap-1">
          <CardTitle className="text-2xl">
            <h1>{name}</h1>
          </CardTitle>
          <CardDescription className="flex items-center gap-1">
            <MapPin className="size-4 shrink-0" aria-hidden />
            {address}, {city}
          </CardDescription>
        </div>

        <div className="flex flex-wrap gap-2 text-xs">
          <span className="rounded-md bg-muted px-2 py-1">
            {units.length} {units.length === 1 ? 'unit' : 'units'}
          </span>
          <span className="rounded-md bg-emerald-100 px-2 py-1 text-emerald-800">
            {occupied} occupied
          </span>
          <span className="rounded-md bg-amber-100 px-2 py-1 text-amber-800">
            {units.length - occupied} vacant
          </span>
        </div>

        {notes && <p className="whitespace-pre-line text-muted-foreground">{notes}</p>}
      </CardContent>
    </Card>
  );
}
