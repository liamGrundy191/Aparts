import { useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { createUnitSchema, type CreateUnitInput } from '@aparts/shared';
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
import { FormField } from './FormField';

interface UnitFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: CreateUnitInput) => void;
  isSubmitting?: boolean;
  /** Server error message, e.g. from the mutation */
  error?: string | null;
  /** Pass these to reuse the dialog for editing */
  defaultValues?: Partial<CreateUnitInput>;
  title?: string;
  submitLabel?: string;
}

const emptyValues: CreateUnitInput = {
  bedrooms: 0,
  rentAmount: 0,
  unitNumber: '',
};

export function UnitFormDialog({
  open,
  onOpenChange,
  onSubmit,
  isSubmitting = false,
  error,
  defaultValues,
  title = 'Add Unit',
  submitLabel = 'Add',
}: UnitFormDialogProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<CreateUnitInput>({
    resolver: zodResolver(createUnitSchema),
    defaultValues: { ...emptyValues, ...defaultValues },
  });

  // Start fresh every time the dialog opens, so old input/errors don't linger
  useEffect(() => {
    if (open) reset({ ...emptyValues, ...defaultValues });
  }, [open, defaultValues, reset]);

  // A ref, not the isSubmitting prop: the prop only updates after the next render,
  // so a fast double-click would still submit twice.
  const submitted = useRef(false);
  useEffect(() => {
    if (!isSubmitting) submitted.current = false;
  }, [isSubmitting, open]);

  const submitOnce = (values: CreateUnitInput) => {
    if (submitted.current) return;
    submitted.current = true;
    onSubmit(values);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>Fill in the unit details.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(submitOnce)} noValidate className="flex flex-col gap-4">
          <FormField id="unitNumber" label="Unit number" error={errors.unitNumber?.message}>
            <Input
              id="unitNumber"
              aria-invalid={!!errors.unitNumber}
              autoFocus
              {...register('unitNumber')}
            />
          </FormField>

          <FormField id="bedrooms" label="Bedrooms" error={errors.bedrooms?.message}>
            <Input
              id="bedrooms"
              type="number"
              aria-invalid={!!errors.bedrooms}
              {...register('bedrooms', { valueAsNumber: true })}
            />
          </FormField>

          <FormField id="rentAmount" label="Rent amount" error={errors.rentAmount?.message}>
            <Input
              id="rentAmount"
              type="number"
              step="0.01"
              aria-invalid={!!errors.rentAmount}
              {...register('rentAmount', { valueAsNumber: true })}
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
              {submitLabel}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
