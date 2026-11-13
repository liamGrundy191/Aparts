import { z } from 'zod';

export const createUnitSchema = z.object({
  unitNumber: z.string().trim().nonempty('unit number is required').max(20),
  bedrooms: z
    .number({ invalid_type_error: 'bedrooms is required' })
    .int('must be a whole number')
    .min(0)
    .max(20),
  rentAmount: z
    .number({ invalid_type_error: 'rent amount is required' })
    .positive()
    .max(99_999_999.99)
    .refine((n) => Math.round(n * 100) === n * 100, 'max 2 decimal places'),
});

export type CreateUnitInput = z.infer<typeof createUnitSchema>;
