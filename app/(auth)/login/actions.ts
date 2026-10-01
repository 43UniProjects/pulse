'use server';

import { redirect } from 'next/navigation';
import { findUserByCredentials, UserRole } from './data';

export interface ActionState {
  error?: string;
}

export async function authenticateUser(
  prevState: ActionState | null,
  formData: FormData,
): Promise<ActionState | null> {
  const email = formData.get('email')?.toString();
  const password = formData.get('password')?.toString();
  const role = formData.get('role')?.toString() as UserRole;

  if (!email || !password || !role) {
    return { error: 'All fields are required to initialize session.' };
  }

  try {
    const user = await findUserByCredentials(email, role);

    if (!user) {
      return { error: 'Invalid credentials or incorrect access level.' };
    }

    // ==========================================================
    // BACKEND INTEGRATION NOTE:
    // Replace the above mock check with your actual Express API call:
    // const res = await fetch('http://localhost:5000/api/auth/login', { ... })
    // const { token } = await res.json();
    // cookies().set('pulse_token', token, { httpOnly: true });
    // ==========================================================
  } catch (error) {
    console.error('Auth error:', error);
    return { error: 'Connection to authentication server failed.' };
  }

  // Redirect must happen outside the try/catch block in Next.js
  if (role === 'donor') redirect('/donor/dashboard');
  if (role === 'hospital') redirect('/hospital/dashboard');
  redirect('/admin/dashboard');
}
