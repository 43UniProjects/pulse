import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth/config';
import { connectToDatabase } from '@/lib/db/connect';
import { User } from '@/lib/models/user.model';

export async function validateRoleAccess(
  requiredRole: 'donor' | 'hospital' | 'admin',
  options?: { allowInactive?: boolean },
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

  // 3. If account is deactivated / profile incomplete and route requires active account -> redirect to profile setup
  if (!options?.allowInactive && session.user.role !== 'admin') {
    if (session.user.isActive === false) {
      await connectToDatabase();
      const user = await User.findById(session.user.id)
        .select('isActive')
        .lean();
      if (!user?.isActive) {
        redirect(`/${session.user.role}/profile?setup=true`);
      }
    }
  }

  return session;
}
