import { z } from 'zod';

export const contactSchema = z.object({
  userId: z.string().optional(),
  senderRole: z.string().min(1, 'Role is required'),
  targetAudience: z.string().min(1, 'Please select a department'),
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.email('Invalid email address'),
  subject: z.string().min(5, 'Subject must be at least 5 characters'),
  message: z.string().min(10, 'Message must be at least 10 characters'),
});
