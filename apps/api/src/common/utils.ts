import { Prisma } from '@prisma/client';

// Prisma error codes: https://www.prisma.io/docs/orm/reference/error-reference
export const UNIQUE_VIOLATION = 'P2002';
export const FOREIGN_KEY_VIOLATION = 'P2003';
export const RECORD_NOT_FOUND = 'P2025';

export function prismaCode(error: unknown): string | undefined {
  return error instanceof Prisma.PrismaClientKnownRequestError ? error.code : undefined;
}
