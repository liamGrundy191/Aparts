// Mirrors the Prisma enums in apps/api/prisma/schema.prisma.
// Keep these in sync when the schema changes.

export const Role = { MANAGER: 'MANAGER', TENANT: 'TENANT' } as const;
export type Role = (typeof Role)[keyof typeof Role];

export const UnitStatus = { VACANT: 'VACANT', OCCUPIED: 'OCCUPIED' } as const;
export type UnitStatus = (typeof UnitStatus)[keyof typeof UnitStatus];

export const LeaseStatus = { ACTIVE: 'ACTIVE', ENDED: 'ENDED' } as const;
export type LeaseStatus = (typeof LeaseStatus)[keyof typeof LeaseStatus];

export const MaintenanceStatus = {
  OPEN: 'OPEN',
  IN_PROGRESS: 'IN_PROGRESS',
  DONE: 'DONE',
} as const;
export type MaintenanceStatus = (typeof MaintenanceStatus)[keyof typeof MaintenanceStatus];

export const Priority = { LOW: 'LOW', MEDIUM: 'MEDIUM', HIGH: 'HIGH' } as const;
export type Priority = (typeof Priority)[keyof typeof Priority];
