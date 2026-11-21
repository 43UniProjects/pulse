import { Metadata } from 'next';
import { Suspense } from 'react';
import { validateRoleAccess } from '@/lib/auth/guard';
import { connectToDatabase } from '@/lib/db/connect';
import { Admin } from '@/lib/models/admin.model';
import { AdminEntity } from '@/types/admin.type';
import GenericFallback from '@/components/fallback';
import AdminProfileClient from '@/app/(users)/admin/profile/admin-profile-client';

export const metadata: Metadata = {
  title: 'Admin Profile | Pulse',
  description: 'Manage your administrative account details.',
};

async function AdminProfileContent() {
  const session = await validateRoleAccess('admin');
  await connectToDatabase();

  const adminDoc = await Admin.findByIdAndUpdate(
    session.user.id,
    {
      $setOnInsert: {
        _id: session.user.id,
        fullName: session.user.name || 'System Administrator',
        email: session.user.email,
        phone: '+94 77 000 0000',
        role: 'superadmin',
        status: 'active',
        department: 'Operations',
        actionsLogged: 0,
      },
    },
    {
      upsert: true,
      returnDocument: 'after',
      setDefaultsOnInsert: true,
    },
  ).lean();

  const serializedAdmin = {
    ...adminDoc,
    _id: adminDoc._id.toString(),
    lastLoginAt: adminDoc.lastLoginAt ? new Date(adminDoc.lastLoginAt) : null,
    createdAt: adminDoc.createdAt ? new Date(adminDoc.createdAt) : undefined,
    updatedAt: adminDoc.updatedAt ? new Date(adminDoc.updatedAt) : undefined,
  } as unknown as AdminEntity;

  return <AdminProfileClient initialData={serializedAdmin} />;
}

export default function AdminProfilePage() {
  return (
    <div className="max-w-5xl mx-auto w-full space-y-6">
      <Suspense fallback={<GenericFallback />}>
        <AdminProfileContent />
      </Suspense>
    </div>
  );
}
