import { useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createLeaseSchema, type CreateLeaseInput, type Unit } from '@aparts/shared';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { toDateInputValue } from '@/lib/format';
import { FormField } from './FormField';

interface LeaseFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: CreateLeaseInput) => void;
  isSubmitting?: boolean;
  /** Server error message, e.g. from the mutation */
  error?: string | null;
  /** The vacant unit the tenant is being added to. Keep it set while the dialog closes. */
  unit: Pick<Unit, 'unitNumber' | 'askingRent'> | null;
}

/** A one-year lease starting today, at the unit's asking rent. The manager can change all of it. */
function defaultsFor(askingRent: number): CreateLeaseInput {
  const today = new Date();
  const inOneYear = new Date(today.getFullYear() + 1, today.getMonth(), today.getDate());
  return {
    email: '',
    phone: '',
    startDate: toDateInputValue(today),
    endDate: toDateInputValue(inOneYear),
    monthlyRent: askingRent,
  };
}

export function LeaseFormDialog({
  open,
  onOpenChange,
  onSubmit,
  isSubmitting = false,
  error,
  unit,
}: LeaseFormDialogProps) {
  // A number, not the unit object: a refetch gives a new object and must not wipe what was typed
  const askingRent = Number(unit?.askingRent ?? 0);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<CreateLeaseInput>({
    resolver: zodResolver(createLeaseSchema),
    defaultValues: defaultsFor(askingRent),
  });

  // Start fresh every time the dialog opens, so old input/errors don't linger
  useEffect(() => {
    if (open) reset(defaultsFor(askingRent));
  }, [open, askingRent, reset]);

  // A ref, not the isSubmitting prop: the prop only updates after the next render,
  // so a fast double-click would still submit twice.
  const submitted = useRef(false);
  useEffect(() => {
    if (!isSubmitting) submitted.current = false;
  }, [isSubmitting, open]);

  const submitOnce = (values: CreateLeaseInput) => {
    if (submitted.current) return;
    submitted.current = true;
    onSubmit(values);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add tenant to unit {unit?.unitNumber}</DialogTitle>
          <DialogDescription>
            The tenant needs an account first. Enter the email and phone they registered with.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(submitOnce)} noValidate className="flex flex-col gap-4">
          <FormField id="email" label="Tenant email" error={errors.email?.message}>
            <Input
              id="email"
              type="email"
              autoComplete="off"
              aria-invalid={!!errors.email}
              autoFocus
              {...register('email')}
            />
          </FormField>

          <FormField id="phone" label="Tenant phone" error={errors.phone?.message}>
            <Input
              id="phone"
              type="tel"
              autoComplete="off"
              aria-invalid={!!errors.phone}
              {...register('phone')}
            />
          </FormField>

          <div className="grid grid-cols-2 gap-3">
            <FormField id="startDate" label="Start date" error={errors.startDate?.message}>
              <Input
                id="startDate"
                type="date"
                aria-invalid={!!errors.startDate}
                {...register('startDate')}
              />
            </FormField>
            <FormField id="endDate" label="End date" error={errors.endDate?.message}>
              <Input
                id="endDate"
                type="date"
                aria-invalid={!!errors.endDate}
                {...register('endDate')}
              />
            </FormField>
          </div>

          <FormField
            id="monthlyRent"
            label="Monthly rent"
            hint="Starts at the unit's asking rent"
            error={errors.monthlyRent?.message}
          >
            <Input
              id="monthlyRent"
              type="number"
              step="0.01"
              aria-invalid={!!errors.monthlyRent}
              {...register('monthlyRent', { valueAsNumber: true })}
            />
          </FormField>

          {error && (
            <p className="text-sm text-destructive" role="alert">
              {error}
            </p>
          )}

          <DialogFooter>
            <DialogClose render={<Button type="button" variant="outline" />}>Cancel</DialogClose>
            <Button type="submit" isLoading={isSubmitting} disabled={!isDirty}>
              Add tenant
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
