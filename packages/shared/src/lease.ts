import { z } from 'zod';
import { registerSchema } from './auth';
import type { LeaseStatus } from './enums';
import { moneyField } from './money';

/** True for a real calendar date written as YYYY-MM-DD (so not 2026-02-31). */
export function isDateOnly(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(value); // a date-only string is parsed as UTC midnight
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

const dateField = (label: string) =>
  z.string().nonempty(`${label} is required`).refine(isDateOnly, 'Enter a valid date');

// Dates are date-only strings (YYYY-MM-DD), the format <input type="date"> produces.
// The API stores them as UTC midnight, so always format them in UTC or they can shift a day.
export const createLeaseSchema = z
  .object({
    // The tenant is found by email AND phone together, with the same rules as registration.
    email: registerSchema.shape.email,
    phone: registerSchema.shape.phone,
    startDate: dateField('Start date'),
    endDate: dateField('End date'),
    monthlyRent: moneyField('Monthly rent is required'),
  })
  // YYYY-MM-DD strings sort the same way as the dates they stand for
  .refine((lease) => lease.endDate > lease.startDate, {
    path: ['endDate'],
    message: 'End date must be after the start date',
  });
export type CreateLeaseInput = z.infer<typeof createLeaseSchema>;

/** A lease as the API returns it. Dates are ISO strings, and monthlyRent is a string (Prisma Decimal). */
export interface Lease {
  id: string;
  unitId: string;
  tenantId: string;
  startDate: string;
  endDate: string;
  monthlyRent: string;
  status: LeaseStatus;
}

/**
 * What a tenant may see about one of their leases, for GET /me/leases and GET /me/leases/:id.
 * Only their own lease, their unit and the property's name and address: never the property's
 * notes, its other units, or anything about other tenants.
 */
export interface MyLease {
  id: string;
  startDate: string;
  endDate: string;
  monthlyRent: string;
  status: LeaseStatus;
  unit: {
    id: string;
    unitNumber: string;
    bedrooms: number;
    property: {
      id: string;
      name: string;
      address: string;
      city: string;
    };
  };
}
