import type { ReactNode } from 'react';
import type { MyLease } from '@aparts/shared';
import { formatDate, formatMoney } from '@/lib/format';
import { LeaseStatusBadge } from './StatusBadge';
import { Card, CardAction, CardContent, CardHeader, CardTitle } from './ui/card';

function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b py-2 last:border-b-0 last:pb-0">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="font-medium">{children}</dd>
    </div>
  );
}

/**
 * The tenant's lease page, under <PropertyHeader>: their unit on one card and the lease terms
 * on the other. This is where the manager's page shows the unit table.
 */
export function LeaseSummary({ lease }: { lease: MyLease }) {
  const { unit } = lease;

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>
            <h2>Your unit</h2>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <dl>
            <Row label="Unit">{unit.unitNumber}</Row>
            <Row label="Bedrooms">{unit.bedrooms === 0 ? 'Studio' : unit.bedrooms}</Row>
          </dl>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>
            <h2>Lease</h2>
          </CardTitle>
          <CardAction>
            <LeaseStatusBadge status={lease.status} />
          </CardAction>
        </CardHeader>
        <CardContent>
          <dl>
            <Row label="Start date">{formatDate(lease.startDate)}</Row>
            <Row label="End date">{formatDate(lease.endDate)}</Row>
            <Row label="Monthly rent">{formatMoney(lease.monthlyRent)}</Row>
          </dl>
        </CardContent>
      </Card>
    </div>
  );
}
