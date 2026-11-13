import type { CreateUnitInput, Unit } from '@aparts/shared';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { ConfirmDialog } from './ConfirmDialog';
import { StatusBadge } from './StatusBadge';
import { Button } from './ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { UnitFormDialog } from './UnitFormDialog';
import { useState } from 'react';
import { useCreateUnit, useDeleteUnit, useEditUnit } from '@/hooks/useUnit';
import { getErrorMessage } from '@/lib/errors';

interface Props {
  units: Unit[];
  propertyId: string;
}

export default function UnitTable({ units, propertyId }: Props) {
  const {
    mutate: createMutate,
    reset: resetCreate,
    isPending: isCreating,
    error: createError,
  } = useCreateUnit(propertyId);
  const {
    mutate: editMutate,
    reset: resetEdit,
    isPending: isEditing,
    error: editError,
  } = useEditUnit(propertyId);
  const { mutateAsync: deleteMutate } = useDeleteUnit(propertyId);
  const [open, setOpen] = useState<boolean>(false);
  const [editing, setEditing] = useState<Unit | null>(null);

  const openFormPopup = (unit?: Unit) => {
    // clear the last failed attempt's error
    resetCreate();
    resetEdit();
    setEditing(unit ?? null);
    setOpen(true);
  };

  const handleSubmit = (values: CreateUnitInput) => {
    const onSuccess = () => setOpen(false);
    if (editing) {
      editMutate({ id: editing.id, ...values }, { onSuccess });
    } else {
      createMutate(values, { onSuccess });
    }
  };

  const handleDelete = (unit: Unit) => deleteMutate(unit.id);

  return (
    <div>
      <UnitFormDialog
        onOpenChange={(open) => {
          setOpen(open);
        }}
        onSubmit={handleSubmit}
        open={open}
        defaultValues={editing ? { ...editing, rentAmount: Number(editing.rentAmount) } : undefined}
        error={getErrorMessage(editing ? editError : createError)}
        isSubmitting={editing ? isEditing : isCreating}
        submitLabel={editing ? 'Edit' : 'Add'}
        title={editing ? 'Edit unit' : 'Add unit'}
      />
      <div className="mb-5 flex items-center justify-between">
        <h2 className="text-2xl">Units</h2>
        <Button onClick={() => openFormPopup()}>
          <Plus /> Add unit
        </Button>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Unit</TableHead>
            <TableHead className="hidden sm:table-cell">Bedrooms</TableHead>
            <TableHead>Rent</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="w-24 text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {units.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center text-muted-foreground">
                No units yet
              </TableCell>
            </TableRow>
          ) : (
            units.map((u) => (
              <TableRow key={u.id}>
                <TableCell className="font-medium">
                  {u.unitNumber}
                  {/* the Bedrooms column is hidden on phones to make room for the action buttons */}
                  <span className="block text-xs font-normal text-muted-foreground sm:hidden">
                    {u.bedrooms} bd
                  </span>
                </TableCell>
                <TableCell className="hidden sm:table-cell">{u.bedrooms}</TableCell>
                <TableCell>
                  {Number(u.rentAmount).toLocaleString(undefined, {
                    style: 'currency',
                    currency: 'USD',
                  })}
                </TableCell>
                <TableCell>
                  <StatusBadge status={u.status} />
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    aria-label={`Edit unit ${u.unitNumber}`}
                    onClick={() => openFormPopup(u)}
                  >
                    <Pencil />
                  </Button>
                  <ConfirmDialog
                    trigger={
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        aria-label={`Delete unit ${u.unitNumber}`}
                      >
                        <Trash2 />
                      </Button>
                    }
                    title={`Delete unit ${u.unitNumber}?`}
                    description="This can't be undone."
                    onConfirm={() => handleDelete(u)}
                  />
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
