import type { ReactNode } from 'react';
import { Label } from '@/components/ui/label';

interface FormFieldProps {
  /** Must match the id of the input inside, so clicking the label focuses it */
  id: string;
  label: string;
  /** Pass the React Hook Form error message, e.g. errors.name?.message */
  error?: string;
  hint?: string;
  children: ReactNode;
}

/**
 * Label + input + error message. Works with any input, e.g.
 * <FormField id="name" label="Name" error={errors.name?.message}>
 *   <Input id="name" aria-invalid={!!errors.name} {...register('name')} />
 * </FormField>
 */
export function FormField({ id, label, error, hint, children }: FormFieldProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={id}>{label}</Label>
      {children}
      {error ? (
        <p className="text-xs text-destructive" role="alert">
          {error}
        </p>
      ) : (
        hint && <p className="text-xs text-muted-foreground">{hint}</p>
      )}
    </div>
  );
}
