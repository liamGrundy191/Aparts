import { Pagination } from '@/components/Pagination';
import { PropertyCard } from '@/components/PropertyCard';
import { PropertyFormDialog } from '@/components/PropertyFormDialog';
import { Button } from '@/components/ui/button';
import { useCreateProperty, useProperties } from '@/hooks/useProperty';
import { getErrorMessage } from '@/lib/errors';
import type { CreatePropertyInput } from '@aparts/shared';
import { useState } from 'react';

export default function DashboardPage() {
  const [page, setPage] = useState<number>(1);
  const [open, setOpen] = useState<boolean>(false);
  const { data, isPending, isError, error } = useProperties(page);
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
      },
    });
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
      {isPending && <p className="mt-6">Loading...</p>}
      {isError && <p className="mt-6">error getting your properties: {error.message}</p>}
      <div
        id="properties"
        className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5"
      >
        {data?.data &&
          data.data.map((property) => (
            <PropertyCard
              key={property.id}
              id={property.id}
              name={property.name}
              city={property.city}
              address={property.address}
              unitCount={property._count.units}
            />
          ))}
      </div>
      <div id="pagination" className="mt-8">
        {data?.meta && (
          <Pagination
            totalPages={data.meta.totalPages}
            page={page}
            onPageChange={setPage}
          />
        )}
      </div>
    </div>
  );
}
