import { Pagination } from '@/components/Pagination';
import { PropertyCard } from '@/components/PropertyCard';
import { Button } from '@/components/ui/button';
import { useProperties } from '@/hooks/useProperty';
import { useState } from 'react';

export default function DashboardPage() {
  const [page, setPage] = useState<number>(1);
  const { data, isPending, isError, error } = useProperties(page);

  return (
    <div>
      <div id="top-row" className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold">Manager dashboard</h1>
        <Button>Add Property</Button>
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
            key={page}
            onPageChange={(p) => {
              setPage(p);
            }}
          />
        )}
      </div>
    </div>
  );
}
