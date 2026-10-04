'use server';

import { redirect } from 'next/navigation';
import { findUserByCredentials, UserRole } from './data';
import { loginSchema } from './login.schema';

export interface ActionState {
  error?: string;
}

export async function authenticateUser(
  prevState: ActionState | null,
  formData: FormData,
): Promise<ActionState | null> {
  const validationResult = loginSchema.safeParse({
    role: formData.get('role'),
    email: formData.get('email'),
    password: formData.get('password'),
  });

  if (!validationResult.success) {
    return {
      error:
        validationResult.error.issues[0]?.message ||
        'All fields are required to initialize session.',
    };
  }

  const { email, password, role } = validationResult.data;

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
