import { Suspense } from 'react';
import GenericFallback from '@/components/fallback';
import { validateRoleAccess } from '@/lib/auth/guard';
import { connectToDatabase } from '@/lib/db/connect';
import { User } from '@/lib/models/user.model';
import { UserEntity } from '@/types/user.type';
import ManageUsersClient, {
  SerializedUser,
} from '@/app/(users)/admin/manage-users/manage-users-client';

async function ManageUsersContent() {
  const session = await validateRoleAccess('admin');
  await connectToDatabase();

  const rawUsers = await User.find({ _id: { $ne: session.user.id } })
    .sort({ createdAt: -1 })
    .lean<UserEntity[]>();

  const initialUsers: SerializedUser[] = rawUsers.map((u) => ({
    id: (u._id ?? '').toString(),
    name: u.name || 'Anonymous User',
    role: u.role ? u.role.charAt(0).toUpperCase() + u.role.slice(1) : 'Donor',
    email: u.email,
    status: u.isActive !== false ? 'Active' : 'Suspended',
  }));

  return <ManageUsersClient initialUsers={initialUsers} />;
}

export default function ManageUsersPage() {
  return (
    <Suspense fallback={<GenericFallback />}>
      <ManageUsersContent />
    </Suspense>
  );
}
