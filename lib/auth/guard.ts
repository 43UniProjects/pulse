import { cache } from 'react';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth/config';
import { connectToDatabase } from '@/lib/db/connect';
import { User } from '@/lib/models/user.model';

const getCachedSession = cache(async () => {
  return auth.api.getSession({
    headers: await headers(),
  });
});

const getCachedLiveUser = cache(async (userId: string) => {
  await connectToDatabase();
  return User.findById(userId).select('isActive name').lean();
});

export async function validateRoleAccess(
  requiredRole: 'donor' | 'hospital' | 'admin',
  options?: { allowInactive?: boolean },
) {
  const session = await getCachedSession();

  // 1. If not authenticated at all -> redirect to login with query param to trigger "Please login first" toast
  if (!session?.user) {
    redirect('/login?error=unauthenticated');
  }

  // 2. If authenticated but role does not match -> redirect to unauthorized page
  if (session.user.role !== requiredRole) {
    redirect('/unauthorized');
  }

  // 3. Always sync live activation status from MongoDB for donor/hospital so layouts & routes never use stale session cookies
  if (session.user.role !== 'admin') {
    const dbUser = await getCachedLiveUser(session.user.id);
    const isActuallyActive = Boolean(dbUser?.isActive);

    if (!options?.allowInactive && !isActuallyActive) {
      redirect(`/${session.user.role}/profile?setup=true`);
    }

    return {
      ...session,
      user: {
        ...session.user,
        isActive: isActuallyActive,
        name: dbUser?.name || session.user.name,
      },
    };
  }

  return session;
}
