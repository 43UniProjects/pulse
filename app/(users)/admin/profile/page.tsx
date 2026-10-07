import { Metadata } from 'next';
import { AdminEntity } from '@/types/admin.type';
import AdminProfileClient from './admin-profile-client';

export const metadata: Metadata = {
  title: 'Admin Profile | Pulse',
  description: 'Manage your administrative account details.',
};

export default async function AdminProfilePage() {
  // Statically defined typed mock object for Admin
  const mockAdmin: AdminEntity = {
    _id: '64d1f2a3e4b5c6d7e8f9c0d3', // matches base User._id conceptually
    fullName: 'Anura Bandara',
    email: 'anura.admin@pulse.lk',
    phone: '+94 77 987 6543',
    role: 'superadmin',
    status: 'active',
    department: 'System Administration',
    lastLoginAt: new Date('2024-05-15T08:30:00Z'),
    actionsLogged: 12450,
    createdAt: new Date('2023-01-01T00:00:00Z'),
    updatedAt: new Date('2024-05-10T12:00:00Z'),
  };

  return (
    <div className="max-w-5xl mx-auto w-full space-y-6">
      <AdminProfileClient initialData={mockAdmin} />
    </div>
  );
}
