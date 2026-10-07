'use server';

import { z } from 'zod';

export const ContactFormSchema = z.object({
  name: z
    .string()
    .min(2, { message: 'Name must be at least 2 characters' })
    .optional(),
  email: z.string().email({ message: 'Invalid email address' }).optional(),
  subject: z
    .string()
    .min(3, { message: 'Subject must be at least 3 characters' }),
  message: z
    .string()
    .min(10, { message: 'Message must be at least 10 characters' }),
});

export type ActionState = {
  success: boolean;
  message: string;
  errors?: Record<string, string[]>;
};

export async function submitContactMessage(
  prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  // TODO: NextAuth session verification and DB saving will be implemented in the next step.

  return {
    success: false,
    message: 'Action not fully implemented yet.',
  };
}
