import { useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createPropertySchema, type CreatePropertyInput } from '@aparts/shared';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
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

interface PropertyFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: CreatePropertyInput) => void;
  isSubmitting?: boolean;
  /** Server error message, e.g. from the mutation */
  error?: string | null;
  /** Pass these to reuse the dialog for editing */
  defaultValues?: Partial<CreatePropertyInput>;
  title?: string;
  submitLabel?: string;
}

const emptyValues: CreatePropertyInput = { name: '', address: '', city: '', notes: '' };

export function PropertyFormDialog({
  open,
  onOpenChange,
  onSubmit,
  isSubmitting = false,
  error,
  defaultValues,
  title = 'Add property',
  submitLabel = 'Add',
}: PropertyFormDialogProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<CreatePropertyInput>({
    resolver: zodResolver(createPropertySchema),
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

  const submitOnce = (values: CreatePropertyInput) => {
    if (submitted.current) return;
    submitted.current = true;
    onSubmit(values);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>Fill in the property details.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(submitOnce)} noValidate className="flex flex-col gap-4">
          <FormField id="name" label="Name" error={errors.name?.message}>
            <Input id="name" aria-invalid={!!errors.name} autoFocus {...register('name')} />
          </FormField>

          <FormField id="address" label="Address" error={errors.address?.message}>
            <Input id="address" aria-invalid={!!errors.address} {...register('address')} />
          </FormField>

          <FormField id="city" label="City" error={errors.city?.message}>
            <Input id="city" aria-invalid={!!errors.city} {...register('city')} />
          </FormField>

          <FormField id="notes" label="Notes" hint="Optional" error={errors.notes?.message}>
            <Textarea id="notes" rows={3} {...register('notes')} />
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
