import { useDeleteProperty, useEditProperty, useGetProperty } from '@/hooks/useProperty';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Pencil, RotateCw, Trash, TriangleAlert } from 'lucide-react';
import { EmptyState } from '@/components/EmptyState';
import PropertyDetails, { PropertyDetailsSkeleton } from '@/components/PropertyDetails';
import UnitTable from '@/components/UnitTable';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { PropertyFormDialog } from '@/components/PropertyFormDialog';
import { useState } from 'react';
import type { CreatePropertyInput } from '@aparts/shared';
import { getErrorMessage } from '@/lib/errors';

export default function PropertyPage() {
  const { id } = useParams<{ id: string }>();
  const { data, isLoading, isError, refetch, isFetching } = useGetProperty(id!);
  const {
    mutate: mutateEdit,
    reset: resetEdit,
    isPending: isEditPending,
    error: editError,
  } = useEditProperty();
  const { mutateAsync: mutateDelete } = useDeleteProperty(id!);
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState<boolean>(false);

  const handleEdit = (values: CreatePropertyInput) => {
    mutateEdit(
      {
        id: id!,
        ...values,
      },
      {
        onSuccess: () => {
          setOpen(false);
        },
      },
    );
  };

  const handleDelete = () => mutateDelete(id!);

  return (
    <div>
      <PropertyFormDialog
        onOpenChange={(open) => {
          setOpen(open);
        }}
        onSubmit={handleEdit}
        open={open}
        defaultValues={{
          address: data?.address,
          city: data?.city,
          name: data?.name,
          notes: data?.notes ?? '',
        }}
        title="Edit property"
        key={data?.id}
        submitLabel="Edit"
        error={getErrorMessage(editError)}
        isSubmitting={isEditPending}
      />
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <Button
          variant="ghost"
          className="-ml-2.5"
          // go back to the same dashboard page; 'default' means the user opened this URL directly
          onClick={() => (location.key === 'default' ? navigate('/manager') : navigate(-1))}
        >
          <ArrowLeft />
          Back to properties
        </Button>

        {data && (
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => {
                resetEdit(); // clear the last failed attempt's error
                setOpen(true);
              }}
            >
              <Pencil />
              Edit
            </Button>
            <ConfirmDialog
              trigger={
                <Button variant="destructive">
                  <Trash />
                  Delete
                </Button>
              }
              title={`Delete ${data?.name ?? 'property'}?`}
              description="This also deletes all of its units. This can't be undone."
              onConfirm={handleDelete}
            />
          </div>
        )}
      </div>

      {isLoading && <PropertyDetailsSkeleton />}

      {isError && (
        <EmptyState
          icon={TriangleAlert}
          title="Couldn't load this property"
          description="It may have been deleted, or the server is unreachable."
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
          <PropertyDetails property={data} />
          <UnitTable units={data.units} propertyId={id!} />
        </div>
      )}
    </div>
  );
}
