import { UnitStatus, type CreateLeaseInput, type CreateUnitInput, type Unit } from '@aparts/shared';
import { Pencil, Plus, Trash2, UserPlus } from 'lucide-react';
import { ConfirmDialog } from './ConfirmDialog';
import { LeaseFormDialog } from './LeaseFormDialog';
import { StatusBadge } from './StatusBadge';
import { Button } from './ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { UnitFormDialog } from './UnitFormDialog';
import { useMemo, useState } from 'react';
import { useCreateLease } from '@/hooks/useLease';
import { useCreateUnit, useDeleteUnit, useEditUnit } from '@/hooks/useUnit';
import { getErrorMessage } from '@/lib/errors';
import { formatMoney } from '@/lib/format';

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
  // The unit a tenant is being added to. It stays set while the dialog closes, so the title doesn't flicker.
  const [leasing, setLeasing] = useState<Unit | null>(null);
  const [leaseOpen, setLeaseOpen] = useState<boolean>(false);

  // Memoized: a new object on every render would make the dialog reset itself and lose what was typed
  const editDefaults = useMemo(
    () => (editing ? { ...editing, askingRent: Number(editing.askingRent) } : undefined),
    [editing],
  );

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

  const {
    mutate: leaseMutate,
    reset: resetLease,
    isPending: isLeasing,
    error: leaseError,
  } = useCreateLease(propertyId);

  const handleAddTenant = (values: CreateLeaseInput) => {
    if (!leasing) return;
    leaseMutate({ unitId: leasing.id, ...values }, { onSuccess: () => setLeaseOpen(false) });
  };

  const openLeaseDialog = (unit: Unit) => {
    resetLease(); // clear the last failed attempt's error
    setLeasing(unit);
    setLeaseOpen(true);
  };

  return (
    <div>
      <UnitFormDialog
        onOpenChange={(open) => {
          setOpen(open);
        }}
        onSubmit={handleSubmit}
        open={open}
        defaultValues={editDefaults}
        error={getErrorMessage(editing ? editError : createError)}
        isSubmitting={editing ? isEditing : isCreating}
        submitLabel={editing ? 'Edit' : 'Add'}
        title={editing ? 'Edit unit' : 'Add unit'}
      />
      <LeaseFormDialog
        open={leaseOpen}
        onOpenChange={setLeaseOpen}
        onSubmit={handleAddTenant}
        unit={leasing}
        error={getErrorMessage(leaseError)}
        isSubmitting={isLeasing}
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
            <TableHead>Asking rent</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="w-32 text-right">Actions</TableHead>
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
                <TableCell>{formatMoney(u.askingRent)}</TableCell>
                <TableCell>
                  <StatusBadge status={u.status} />
                </TableCell>
                <TableCell className="text-right">
                  {u.status === UnitStatus.VACANT && (
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      aria-label={`Add tenant to unit ${u.unitNumber}`}
                      title="Add tenant"
                      onClick={() => openLeaseDialog(u)}
                    >
                      <UserPlus />
                    </Button>
                  )}
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
