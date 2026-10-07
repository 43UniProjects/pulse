import { z } from 'zod';
import { USER_ROLE } from '@/types/user.type';

export const registerSchema = z
  .object({
    role: z.enum(USER_ROLE),
    email: z.string().email({ message: 'Invalid email address' }),
    password: z
      .string()
      .min(8, { message: 'Password must be at least 8 characters' }),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });
