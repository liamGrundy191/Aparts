import { z } from 'zod';

/** A positive amount with at most 2 decimals that fits a Decimal(10, 2) column. */
export const moneyField = (requiredMessage: string) =>
  z
    .number({ invalid_type_error: requiredMessage })
    .positive()
    .max(99_999_999.99)
    .refine((n) => Math.round(n * 100) === n * 100, 'max 2 decimal places');
