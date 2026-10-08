'use server';

import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { SignJWT } from 'jose';
import { findUserByCredentials } from './data';
import { UserRole } from '@/types/user.type';
import { loginSchema } from '../_validators/auth.schema';

export interface ActionState {
  error?: string;
  fieldErrors?: {
    email?: string[];
    password?: string[];
    role?: string[];
  };
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
    return {
      fieldErrors: validatedFields.error.flatten().fieldErrors,
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
  } catch (error) {
    console.error('Auth error:', error);
    return { error: 'Connection to authentication server failed.' };
  }

  if (role === 'donor') redirect('/donor/dashboard');
  if (role === 'hospital') redirect('/hospital/dashboard');
  redirect('/admin/dashboard');
}
