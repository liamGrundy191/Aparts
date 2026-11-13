import { UnitStatus } from '@aparts/shared';
import { Badge } from '@/components/ui/badge';

const STYLES: Record<UnitStatus, { label: string; className: string }> = {
  [UnitStatus.VACANT]: { label: 'Vacant', className: 'bg-amber-100 text-amber-800' },
  [UnitStatus.OCCUPIED]: { label: 'Occupied', className: 'bg-emerald-100 text-emerald-800' },
};

export function StatusBadge({ status }: { status: UnitStatus }) {
  const { label, className } = STYLES[status];
  return <Badge className={className}>{label}</Badge>;
}
