'use server';

import { z } from 'zod';

// Zod Schema based on AdminEntity Form requirements
const adminSchema = z.object({
  fullName: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid contact email address'),
  phone: z.string().optional().or(z.literal('')),
  department: z.string().min(2, 'Department is required'),
});

export type AdminActionState = {
  success?: boolean;
  message?: string;
  errors?: Record<string, string[]>;
};

export async function updateAdminProfile(
  prevState: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  // Simulate network delay for pending state
  await new Promise((resolve) => setTimeout(resolve, 1000));

  const rawData = {
    fullName: formData.get('fullName'),
    email: formData.get('email'),
    phone: formData.get('phone'),
    department: formData.get('department'),
  };

  const validatedData = adminSchema.safeParse(rawData);

  if (!validatedData.success) {
    return {
      success: false,
      message: 'Please fix the errors in the form.',
      errors: validatedData.error.flatten().fieldErrors,
    };
  }

  // Normally, update DB here using the verified data

  return {
    success: true,
    message: 'Profile updated successfully!',
  };
}
