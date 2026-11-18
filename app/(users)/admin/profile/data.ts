import { connectToDatabase } from '@/lib/db/connect';
import { Admin } from '@/lib/models/admin.model';
import { AdminEntity } from '@/types/admin.type';

/**
 * Retrieves an admin's profile from MongoDB.
 */
export async function getAdminProfile(
  adminId: string,
): Promise<AdminEntity | null> {
  await connectToDatabase();
  const admin = await Admin.findById(adminId).lean();
  if (!admin) return null;

  return {
    ...admin,
    _id: admin._id.toString(),
    lastLoginAt: admin.lastLoginAt ? new Date(admin.lastLoginAt) : null,
    createdAt: admin.createdAt ? new Date(admin.createdAt) : undefined,
    updatedAt: admin.updatedAt ? new Date(admin.updatedAt) : undefined,
  } as unknown as AdminEntity;
}
