import { z } from 'zod';

export const userRoleEnum = z.enum(['donor', 'hospital', 'admin']);

export const loginSchema = z.object({
  role: userRoleEnum,
  email: z
    .string()
    .trim()
    .min(1, 'Email is required')
    .email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters long'),
});

export type LoginInput = z.infer<typeof loginSchema>;
