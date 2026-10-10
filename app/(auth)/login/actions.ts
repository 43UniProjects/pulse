'use server';

import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { SignJWT } from 'jose';
import { findUserByCredentials } from './data';
import { UserRole } from '@/types/user.type';
import { loginSchema } from '../_validators/auth.schema';

export interface ActionState {
  success?: boolean;
  error?: string;
  fieldErrors?: Record<string, string[]>;
  redirectUrl?: string;
}

export async function authenticateUser(
  _prevState: ActionState | null,
  formData: FormData,
): Promise<ActionState | null> {
  // 1. Parse FormData into a plain object
  const rawData = Object.fromEntries(formData.entries());

  // 2. Validate using Zod
  const validatedFields = loginSchema.safeParse(rawData);

  // 3. Return early if validation fails, passing errors to the client
  if (!validatedFields.success) {
    const fieldErrors: Record<string, string[]> = {};

    validatedFields.error.issues.forEach((issue) => {
      const field = String(issue.path[0]);
      if (!fieldErrors[field]) fieldErrors[field] = [];
      fieldErrors[field].push(issue.message);
    });

    return {
      fieldErrors,
      error: 'Please fix the errors in the form.',
    };
  }

  const { email, password, role } = validatedFields.data;

  try {
    const user = await findUserByCredentials(email, password, role as UserRole);

    if (!user) {
      return { error: 'Invalid credentials or incorrect access level.' };
    }

    const secretKey = process.env.JWT_SECRET || 'pulse-default-dev-secret-key';
    const secret = new TextEncoder().encode(secretKey);

    const token = await new SignJWT({ _id: user._id, role: user.role })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('7d')
      .sign(secret);

    const cookieStore = await cookies();
    cookieStore.set('pulse_session', token, {
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
    });
  } catch (error: unknown) {
    console.error('[Action: authenticateUser]', error);
    return { error: 'An unexpected error occurred.' };
  }

  let redirectUrl = '/admin/dashboard';
  if (role === 'donor') redirectUrl = '/donor/dashboard';
  if (role === 'hospital') redirectUrl = '/hospital/dashboard';

  return { success: true, redirectUrl };
}

export async function logoutUser() {
  const cookieStore = await cookies();
  cookieStore.delete('pulse_session');
  redirect('/login');
}
