import { Metadata } from 'next';
import AdminProfileClient from './admin-profile-client';
import { getAdminProfile } from './data';

export const metadata: Metadata = {
  title: 'Admin Profile | Pulse',
  description: 'Manage your administrative account details.',
};

export default async function AdminProfilePage() {
  const adminId = 'admin_1';
  const admin = await getAdminProfile(adminId);

  if (!admin) {
    return (
      <div className="flex items-center justify-center h-[60vh] text-muted-foreground">
        Profile data not found.
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto w-full space-y-6">
      <AdminProfileClient initialData={admin} />
    </div>
  );
}
