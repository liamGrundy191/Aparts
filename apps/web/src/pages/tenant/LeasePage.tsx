import { EmptyState } from '@/components/EmptyState';
import { LeaseSummary } from '@/components/LeaseSummary';
import { PropertyDetailsSkeleton, PropertyHeader } from '@/components/PropertyDetails';
import { Button } from '@/components/ui/button';
import { useMyLease } from '@/hooks/useLease';
import { ArrowLeft, RotateCw, TriangleAlert } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';

export default function LeasePage() {
  const { leaseId } = useParams<{ leaseId: string }>();
  const { data, isLoading, isError, refetch, isFetching } = useMyLease(leaseId!);
  const navigate = useNavigate();

  return (
    <div>
      <Button variant="ghost" className="mb-4 -ml-2.5" onClick={() => navigate('/tenant')}>
        <ArrowLeft />
        Back to my leases
      </Button>

      {isLoading && <PropertyDetailsSkeleton />}

      {isError && (
        <EmptyState
          icon={TriangleAlert}
          title="Couldn't load this lease"
          description="It may not exist, or the server is unreachable."
          action={
            <Button variant="outline" onClick={() => refetch()} isLoading={isFetching}>
              <RotateCw />
              Try again
            </Button>
          }
        />
      )}

      {data && (
        <div className="flex flex-col gap-6">
          <PropertyHeader {...data.unit.property} />
          <LeaseSummary lease={data} />
        </div>
      )}
    </div>
  );
}
