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
  error?: string;
  fieldErrors?: Record<string, string[]>;
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
    const fieldErrors: Record<string, string[]> = {};
    validatedData.error.issues.forEach((issue) => {
      const field = String(issue.path[0]);
      if (!fieldErrors[field]) fieldErrors[field] = [];
      fieldErrors[field].push(issue.message);
    });

    return {
      success: false,
      error: 'Please fix the errors in the form.',
      fieldErrors,
    };
  }

  try {
    // Normally, update DB here using the verified data
    return {
      success: true,
    };
  } catch (error: unknown) {
    console.error('[Action: updateAdminProfile]', error);
    return {
      success: false,
      error: 'An unexpected error occurred while updating the profile.',
    };
  }
}
