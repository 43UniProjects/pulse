import { z } from 'zod';
import { USER_ROLES } from '@/types/user.type';

export const registerSchema = z
  .object({
    role: z.enum(USER_ROLES),
    email: z.string().email('Invalid email address'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });
