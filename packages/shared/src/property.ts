import { z } from 'zod';
import { UnitStatus } from './enums';

export const createPropertySchema = z.object({
  name: z.string().trim().nonempty('name is required').max(100),
  address: z.string().trim().nonempty('address is required').max(200),
  city: z.string().trim().nonempty('city is required').max(100),
  notes: z.string().max(1000).optional(),
});
export type CreatePropertyInput = z.infer<typeof createPropertySchema>;

export interface Property {
  id: string;
  name: string;
  address: string;
  city: string;
  notes?: string | null; // the API sends null when a property has no notes
}

interface meta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface propertyAndUnitCount extends Property {
  _count: {
    units: number;
  };
}

export interface PaginationProperty {
  data: propertyAndUnitCount[];
  meta: meta;
}

export interface Unit {
  id: string;
  propertyId: string;
  unitNumber: string;
  bedrooms: number;
  rentAmount: string;
  status: UnitStatus;
}

export interface PropertyWithUnits extends Property {
  units: Unit[];
}
