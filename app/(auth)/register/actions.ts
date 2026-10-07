'use server';

import { redirect } from 'next/navigation';
import { createAccount } from './data';
import { AccountType, RegistrationPayload } from './types';

import { registerSchema } from '@/lib/validators/auth.schema';

export interface RegisterActionState {
  error?: string;
}

export async function registerAccount(
  prevState: RegisterActionState | null,
  formData: FormData,
): Promise<RegisterActionState | null> {
  const payload = Object.fromEntries(formData.entries());

  const validation = registerSchema.safeParse({
    role:
      payload.role === 'donor'
        ? 'Donor'
        : payload.role === 'hospital'
          ? 'Hospital'
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

  // Format role back to lowercase for internal mock storage
  const formattedRole = role.toLowerCase() as AccountRole;

  try {
    // Call the mock database (or your real Express backend)
    await createAccount(formattedRole, { email, password });

    // Call the mock database with the typed payload
    await createAccount(typedPayload);

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
