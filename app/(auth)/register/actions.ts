'use server';

import { redirect } from 'next/navigation';
import { createAccount } from './data';
import { AccountType, RegistrationPayload } from './types';
import { registerSchema } from '../_validators/auth.schema';

export interface RegisterActionState {
  success?: boolean;
  error?: string;
  fieldErrors?: Record<string, string[]>;
}

export async function registerAccount(
  _prevState: RegisterActionState | null,
  formData: FormData,
): Promise<RegisterActionState | null> {
  const rawData = Object.fromEntries(formData.entries());

  const validation = registerSchema.safeParse(rawData);

  if (!validation.success) {
    const fieldErrors: Record<string, string[]> = {};

    validation.error.issues.forEach((issue) => {
      const field = String(issue.path[0]);
      if (!fieldErrors[field]) fieldErrors[field] = [];
      fieldErrors[field].push(issue.message);
    });

    return {
      fieldErrors,
      error: 'Please fix the errors in the form.',
    };
  }

  const { role, email, password, username } = validation.data;

  try {
    await createAccount({
      email,
      password,
      role: role as AccountType,
      username,
    } as RegistrationPayload & { username: string });
  } catch (error: unknown) {
    console.error('Registration error:', error);
    return { error: 'An unexpected error occurred.' };
  }

  redirect('/verify-email');
}
