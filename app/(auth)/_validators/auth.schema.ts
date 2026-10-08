import { z } from 'zod';
import { USER_ROLE } from '@/types/user.type';

export const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters long')
  .regex(/[A-Z]/, 'Must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Must contain at least one lowercase letter')
  .regex(/[0-9]/, 'Must contain at least one number')
  .regex(/[^A-Za-z0-9]/, 'Must contain at least one special character');

export const usernameSchema = z
  .string()
  .min(3, 'Username must be at least 3 characters')
  .regex(/^[a-zA-Z]/, 'Username must start with a letter');

export const registerSchema = z
  .object({
    role: z.enum(USER_ROLE, {
      error: 'Invalid account type selected',
    }),
    username: usernameSchema,
    email: z.email('Invalid email address'),
    password: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    error: "Passwords don't match",
    path: ['confirmPassword'],
  });

export const loginSchema = z.object({
  role: z.enum(USER_ROLE, {
    error: 'Invalid account type selected',
  }),
  email: z.email('Invalid email address'),
  password: passwordSchema,
});
