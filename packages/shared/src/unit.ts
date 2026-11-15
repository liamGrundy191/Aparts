import { z } from 'zod';
import { moneyField } from './money';

export const createUnitSchema = z.object({
  unitNumber: z.string().trim().nonempty('unit number is required').max(20),
  bedrooms: z
    .number({ invalid_type_error: 'bedrooms is required' })
    .int('must be a whole number')
    .min(0)
    .max(20),
  // The price for the next tenant. What a tenant actually owes is the lease's monthlyRent.
  askingRent: moneyField('asking rent is required'),
});

export type CreateUnitInput = z.infer<typeof createUnitSchema>;
