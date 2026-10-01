'use server';

import { redirect } from 'next/navigation';
import { createAccount, AccountRole } from './data';

export interface RegisterActionState {
  error?: string;
}

export async function registerAccount(
  prevState: RegisterActionState | null,
  formData: FormData,
): Promise<RegisterActionState | null> {
  // Extract state-driven fields (requires hidden inputs in the form)
  const role = formData.get('role')?.toString() as AccountRole;
  const location = formData.get('location')?.toString();
  const email = formData.get('email')?.toString();
  const password = formData.get('password')?.toString();

  if (!role || !email || !password) {
    return { error: 'Please fill out all required fields.' };
  }

  if (!location) {
    return { error: 'Please acquire or enter your location coordinates.' };
  }

  try {
    // Convert the entire FormData map into a plain object for the database payload
    const payload = Object.fromEntries(formData.entries());

    // Call the mock database (or your real Express backend)
    await createAccount(role, payload);

    // ==========================================================
    // BACKEND INTEGRATION NOTE:
    // Replace createAccount with your Express POST request:
    // const res = await fetch('http://localhost:5000/api/auth/register', { ... })
    // const { token } = await res.json();
    // cookies().set('pulse_token', token, { httpOnly: true });
    // ==========================================================

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.error('Registration error:', error);
    return {
      error: error.message || 'Failed to connect to the registration server.',
    };
  }

  // Redirect to the appropriate dashboard on success
  if (role === 'donor') {
    redirect('/donor/dashboard');
  } else {
    redirect('/hospital/dashboard');
  }
}
