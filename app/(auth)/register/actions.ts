'use server';

import { redirect } from 'next/navigation';
import { createAccount } from './data';
import { AccountType, RegistrationPayload } from './types';

export interface RegisterActionState {
  error?: string;
}

export async function registerAccount(
  prevState: RegisterActionState | null,
  formData: FormData,
): Promise<RegisterActionState | null> {
  const role = formData.get('role')?.toString() as AccountType;
  const email = formData.get('email')?.toString();
  const password = formData.get('password')?.toString();

  if (!role || !email || !password) {
    return { error: 'Please fill out all required fields.' };
  }

  try {
    // Convert the entire FormData map into a plain object for the database payload
    const payload = Object.fromEntries(formData.entries());

    // Cast the payload to RegistrationPayload for type safety
    const typedPayload = payload as unknown as RegistrationPayload;

    // Call the mock database with the typed payload
    await createAccount(typedPayload);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.error('Registration error:', error);
    return {
      error: error.message || 'Failed to connect to the registration server.',
    };
  }

  // Redirect to login page for email verification / authentication
  redirect('/login');
}
