import { Pagination } from '@/components/Pagination';
import { PropertyCard, PropertyCardSkeleton } from '@/components/PropertyCard';
import { PropertyFormDialog } from '@/components/PropertyFormDialog';
import { Button } from '@/components/ui/button';
import { useCreateProperty, useProperties } from '@/hooks/useProperty';
import { getErrorMessage } from '@/lib/errors';
import { cn } from '@/lib/utils';
import type { CreatePropertyInput } from '@aparts/shared';
import { useState, type ReactNode } from 'react';
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
  const [page, setPage] = useState<number>(1);
  const [open, setOpen] = useState<boolean>(false);
  const { data, isPending, isError, error, isPlaceholderData } = useProperties(page);
  const {
    mutate,
    reset: resetCreate,
    isPending: isCreatePending,
    error: createError,
  } = useCreateProperty();

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
      return <p className="mt-6">error getting your properties: {getErrorMessage(error)}</p>;
    if (isPending)
      return (
        <Grid>
          {Array.from({ length: 10 }, (_, i) => (
            <PropertyCardSkeleton key={i} />
          ))}
        </Grid>
      );
    if (data.data.length === 0)
      return (
        <p className="mt-6">no properties found to show, add properties to start tracking them</p>
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
        <Button
          onClick={() => {
            resetCreate(); // clear the last failed attempt's error
            setOpen(true);
          }}
        >
          Add Property
        </Button>
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
