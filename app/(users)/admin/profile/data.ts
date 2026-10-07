import { AdminEntity } from '@/types/admin.type';

const ADMINS_DB: Record<string, AdminEntity> = {
  admin_1: {
    _id: 'admin_1', // matches base User._id conceptually
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
  },
};

/**
 * Retrieves an admin's profile.
 */
export async function getAdminProfile(
  adminId: string,
): Promise<AdminEntity | null> {
  return ADMINS_DB[adminId] || null;
}
