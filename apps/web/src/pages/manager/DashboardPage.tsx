import { Pagination } from '@/components/Pagination';
import { PropertyCard, PropertyCardSkeleton } from '@/components/PropertyCard';
import { PropertyFormDialog } from '@/components/PropertyFormDialog';
import { Button } from '@/components/ui/button';
import { useCreateProperty, useProperties } from '@/hooks/useProperty';
import { getErrorMessage } from '@/lib/errors';
import { cn } from '@/lib/utils';
import type { CreatePropertyInput } from '@aparts/shared';
import { useState, type ReactNode } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Building2, Plus, RotateCw, TriangleAlert } from 'lucide-react';
import { EmptyState } from '@/components/EmptyState';
import { toast } from 'sonner';

const Grid = ({ children, dimmed }: { children: ReactNode; dimmed?: boolean }) => (
  <div
    className={cn(
      'mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 transition-opacity',
      dimmed && 'opacity-50',
    )}
  >
    {children}
  </div>
);

export default function DashboardPage() {
  // page lives in the URL (?page=3) so "Back" from a property returns to it
  const [searchParams, setSearchParams] = useSearchParams();
  const page = Math.max(1, parseInt(searchParams.get('page') ?? '', 10) || 1);
  const setPage = (p: number) => setSearchParams({ page: String(p) });
  const [open, setOpen] = useState<boolean>(false);
  const { data, isPending, isError, isPlaceholderData, refetch, isFetching } = useProperties(page);
  const {
    mutate,
    reset: resetCreate,
    isPending: isCreatePending,
    error: createError,
  } = useCreateProperty();

  const openAddDialog = () => {
    resetCreate(); // clear the last failed attempt's error
    setOpen(true);
  };

  const handleSubmit = (values: CreatePropertyInput) => {
    mutate(values, {
      onSuccess: () => {
        setOpen(false);
        toast.success('Successfully added property');
      },
    });
  };

  const renderProperties = () => {
    if (isError)
      return (
        <div className="mt-6">
          <EmptyState
            icon={TriangleAlert}
            title="Couldn't load your properties"
            description="The server may be unreachable."
            action={
              <Button variant="outline" onClick={() => refetch()} isLoading={isFetching}>
                <RotateCw />
                Try again
              </Button>
            }
          />
        </div>
      );
    if (isPending)
      return (
        <Grid>
          {Array.from({ length: 10 }, (_, i) => (
            <PropertyCardSkeleton key={i} />
          ))}
        </Grid>
      );
    // e.g. a typed ?page=99, or the last item of the last page was just deleted
    if (data.data.length === 0 && page > 1)
      return (
        <div className="mt-6">
          <EmptyState
            icon={Building2}
            title="Nothing on this page"
            description="There are no properties on this page."
            action={
              <Button variant="outline" onClick={() => setPage(1)}>
                Back to page 1
              </Button>
            }
          />
        </div>
      );
    if (data.data.length === 0)
      return (
        <div className="mt-6">
          <EmptyState
            icon={Building2}
            title="No properties yet"
            description="Add your first property to start tracking its units."
            action={
              <Button onClick={openAddDialog}>
                <Plus />
                Add property
              </Button>
            }
          />
        </div>
      );
    return (
      <Grid dimmed={isPlaceholderData}>
        {data.data.map((property) => (
          <PropertyCard
            key={property.id}
            id={property.id}
            name={property.name}
            city={property.city}
            address={property.address}
            unitCount={property._count.units}
          />
        ))}
      </Grid>
    );
  };

  return (
    <div>
      <PropertyFormDialog
        open={open}
        onOpenChange={setOpen}
        onSubmit={handleSubmit}
        error={getErrorMessage(createError)}
        isSubmitting={isCreatePending}
      />
      <div id="top-row" className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold">Manager dashboard</h1>
        <Button onClick={openAddDialog}>Add Property</Button>
      </div>
      {renderProperties()}
      <div id="pagination" className="mt-8">
        {data?.meta && (
          <Pagination totalPages={data.meta.totalPages} page={page} onPageChange={setPage} />
        )}
      </div>
    </div>
  );
}
