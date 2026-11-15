import { LeaseStatus, UnitStatus } from '@aparts/shared';
import { Badge } from '@/components/ui/badge';

type Style = { label: string; className: string };

const UNIT_STYLES: Record<UnitStatus, Style> = {
  [UnitStatus.VACANT]: { label: 'Vacant', className: 'bg-amber-100 text-amber-800' },
  [UnitStatus.OCCUPIED]: { label: 'Occupied', className: 'bg-emerald-100 text-emerald-800' },
};

const LEASE_STYLES: Record<LeaseStatus, Style> = {
  [LeaseStatus.ACTIVE]: { label: 'Active', className: 'bg-emerald-100 text-emerald-800' },
  [LeaseStatus.ENDED]: { label: 'Ended', className: 'bg-muted text-muted-foreground' },
};

export function StatusBadge({ status }: { status: UnitStatus }) {
  const { label, className } = UNIT_STYLES[status];
  return <Badge className={className}>{label}</Badge>;
}

export function LeaseStatusBadge({ status }: { status: LeaseStatus }) {
  const { label, className } = LEASE_STYLES[status];
  return <Badge className={className}>{label}</Badge>;
}
