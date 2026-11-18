import { Metadata } from 'next';
import { validateRoleAccess } from '@/lib/auth/guard';
import { connectToDatabase } from '@/lib/db/connect';
import { Admin } from '@/lib/models/admin.model';
import { AdminEntity } from '@/types/admin.type';
import AdminProfileClient from './admin-profile-client';

export const metadata: Metadata = {
  title: 'Admin Profile | Pulse',
  description: 'Manage your administrative account details.',
};

export default async function AdminProfilePage() {
  const session = await validateRoleAccess('admin');
  await connectToDatabase();

  let adminDoc = await Admin.findById(session.user.id).lean();

  if (!adminDoc) {
    const created = await Admin.create({
      _id: session.user.id,
      fullName: session.user.name || 'System Administrator',
      email: session.user.email,
      phone: '+94 77 000 0000',
      role: 'superadmin',
      status: 'active',
      department: 'Operations',
      actionsLogged: 0,
    });
    adminDoc = created.toObject();
  }

  const serializedAdmin = {
    ...adminDoc,
    _id: adminDoc._id.toString(),
    lastLoginAt: adminDoc.lastLoginAt ? new Date(adminDoc.lastLoginAt) : null,
    createdAt: adminDoc.createdAt ? new Date(adminDoc.createdAt) : undefined,
    updatedAt: adminDoc.updatedAt ? new Date(adminDoc.updatedAt) : undefined,
  } as unknown as AdminEntity;

  return (
    <div className="max-w-5xl mx-auto w-full space-y-6">
      <AdminProfileClient initialData={serializedAdmin} />
    </div>
  );
}
