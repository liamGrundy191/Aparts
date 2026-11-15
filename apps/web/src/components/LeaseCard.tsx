import { LeaseStatus, type MyLease } from '@aparts/shared';
import { formatMoney, formatMonthYear } from '@/lib/format';
import { PropertyCard } from './PropertyCard';

/**
 * One of the tenant's leases, as a card for the "My leases" grid. It looks like the manager's
 * property card and links to the lease page. Use <PropertyCardSkeleton /> while loading.
 */
export function LeaseCard({ lease }: { lease: MyLease }) {
  const { unit } = lease;
  const ended = lease.status === LeaseStatus.ENDED;

  return (
    <PropertyCard
      to={`/tenant/leases/${lease.id}`}
      name={unit.property.name}
      address={unit.property.address}
      city={unit.property.city}
      footer={`Unit ${unit.unitNumber} · ${formatMoney(lease.monthlyRent)}/mo · ${ended ? 'ended' : 'until'} ${formatMonthYear(lease.endDate)}`}
    />
  );
}
