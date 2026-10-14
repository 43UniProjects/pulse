import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth/config';

export async function validateRoleAccess(
  requiredRole: 'donor' | 'hospital' | 'admin',
) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  // 1. If not authenticated at all -> redirect to login with query param to trigger "Please login first" toast
  if (!session?.user) {
    redirect('/login?error=unauthenticated');
  }

  // 2. If authenticated but role does not match -> redirect to unauthorized page
  if (session.user.role !== requiredRole) {
    redirect('/unauthorized');
  }

  return session;
}
