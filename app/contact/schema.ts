import { z } from 'zod';

export const contactSchema = z.object({
  userId: z.string().optional(),
  senderRole: z.string().min(1, 'Role is required'),
  targetAudience: z.string().min(1, 'Please select a department'),
  name: z
    .string()
    .trim()
    .min(2, 'Name must be at least 2 characters')
    .max(120, 'Name cannot exceed 120 characters'),
  email: z.email('Invalid email address').max(254, 'Email is too long'),
  subject: z
    .string()
    .trim()
    .min(5, 'Subject must be at least 5 characters')
    .max(200, 'Subject cannot exceed 200 characters'),
  message: z
    .string()
    .trim()
    .min(10, 'Message must be at least 10 characters')
    .max(4000, 'Message cannot exceed 4000 characters'),
});
