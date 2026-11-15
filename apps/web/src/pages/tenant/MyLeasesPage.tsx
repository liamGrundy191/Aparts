import { EmptyState } from '@/components/EmptyState';
import { LeaseCard } from '@/components/LeaseCard';
import { PropertyCardSkeleton } from '@/components/PropertyCard';
import { Button } from '@/components/ui/button';
import { useMyLeases } from '@/hooks/useLease';
import { KeyRound, RotateCw, TriangleAlert } from 'lucide-react';

export default function MyLeasesPage() {
  const { data, isPending, isError, refetch, isFetching } = useMyLeases();

  const renderLeases = () => {
    if (isError)
      return (
        <EmptyState
          icon={TriangleAlert}
          title="Couldn't load your leases"
          description="The server may be unreachable."
          action={
            <Button variant="outline" onClick={() => refetch()} isLoading={isFetching}>
              <RotateCw />
              Try again
            </Button>
          }
        />
      );
    if (!isPending && data.length === 0)
      return (
        <EmptyState
          icon={KeyRound}
          title="No leases yet"
          description="Your lease shows up here once your property manager adds you to a unit."
        />
      );
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        {isPending
          ? Array.from({ length: 3 }, (_, i) => <PropertyCardSkeleton key={i} />)
          : data.map((lease) => <LeaseCard key={lease.id} lease={lease} />)}
      </div>
    );
  };

  return (
    <div>
      <h1 className="mb-6 text-2xl font-semibold">My leases</h1>
      {renderLeases()}
    </div>
  );
}
