import { z } from 'zod';
import type { Role } from './enums';
import { normalizePhone } from './phone';

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});
export type LoginInput = z.infer<typeof loginSchema>;

// No `role` field on purpose: the API decides the role, never the request body.
export const registerSchema = z.object({
  firstName: z.string().trim().nonempty('First name is required').max(100),
  lastName: z.string().trim().nonempty('Last name is required').max(100),
  email: z.string().trim().email('Enter a valid email address'),
  // Same check the API runs, so the form rejects what the API would reject.
  phone: z
    .string()
    .trim()
    .refine((value) => normalizePhone(value) !== null, 'Enter a valid phone number'),
  password: z.string().min(8, 'At least 8 characters').max(72, 'At most 72 characters'), // bcrypt ignores everything after 72 bytes
});
export type RegisterInput = z.infer<typeof registerSchema>;

export interface AuthUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: Role;
}

export interface AuthResponse {
  accessToken: string;
  user: AuthUser;
}
