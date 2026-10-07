'use server';

import { redirect } from 'next/navigation';
import { createAccount } from './data';
import { AccountType } from './types';
import { registerSchema } from '@/lib/validators/auth.schema';

export interface RegisterActionState {
  error?: string;
}

export async function registerAccount(
  prevState: RegisterActionState | null,
  formData: FormData,
): Promise<RegisterActionState | null> {
  const payload = Object.fromEntries(formData.entries());

  // Using the updated Zod schema for validation
  const validation = registerSchema.safeParse({
    role:
      payload.role === 'donor'
        ? 'donor'
        : payload.role === 'hospital'
          ? 'hospital'
          : undefined,
    email: payload.email,
    password: payload.password,
    confirmPassword: payload.confirmPassword,
  });

  if (!validation.success) {
    return { error: validation.error.issues[0].message };
  }

  // Extract the validated and formatted data
  const { role, email, password } = validation.data;

  // Ensure role matches AccountType
  const formattedRole = role as AccountType;

  try {
    // Call the mock database
    await createAccount({ email, password, role: formattedRole });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.error('Registration error:', error);
    return {
      error: error.message || 'Failed to connect to the registration server.',
    };
  }

  // Redirect to the verify-email step on success
  redirect('/verify-email');
}
