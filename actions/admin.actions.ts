'use server';

import { z } from 'zod';
import { headers } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { connectToDatabase } from '@/lib/db/connect';
import { Admin } from '@/lib/models/admin.model';
import { Hospital } from '@/lib/models/hospital.model';
import { User } from '@/lib/models/user.model';
import { auth } from '@/lib/auth/config';

// Zod Schema based on AdminEntity Form requirements
const adminSchema = z.object({
  fullName: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid contact email address'),
  phone: z.string().optional().or(z.literal('')),
  department: z.string().min(2, 'Department is required'),
});

export type AdminActionState = {
  success?: boolean;
  error?: string;
  fieldErrors?: Record<string, string[]>;
};

export async function updateAdminProfile(
  prevState: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user || session.user.role !== 'admin') {
    return {
      success: false,
      error:
        'You must be logged in as an administrator to update this profile.',
    };
  }

  const rawData = {
    fullName: formData.get('fullName'),
    email: formData.get('email'),
    phone: formData.get('phone'),
    department: formData.get('department'),
  };

  const validatedData = adminSchema.safeParse(rawData);

  if (!validatedData.success) {
    const fieldErrors: Record<string, string[]> = {};
    validatedData.error.issues.forEach((issue) => {
      const field = String(issue.path[0]);
      if (!fieldErrors[field]) fieldErrors[field] = [];
      fieldErrors[field].push(issue.message);
    });

    return {
      success: false,
      error: 'Please check the highlighted fields and try again.',
      fieldErrors,
    };
  }

  try {
    await connectToDatabase();

    await Admin.findByIdAndUpdate(
      session.user.id,
      {
        fullName: validatedData.data.fullName,
        email: validatedData.data.email,
        phone: validatedData.data.phone || undefined,
        department: validatedData.data.department,
        $inc: { actionsLogged: 1 },
      },
      {
        upsert: true,
        returnDocument: 'after',
        setDefaultsOnInsert: true,
      },
    );

    await User.findByIdAndUpdate(session.user.id, {
      name: validatedData.data.fullName,
    });

    revalidatePath('/admin/profile');
    revalidatePath('/admin/dashboard');

    return {
      success: true,
    };
  } catch (error: unknown) {
    console.error('[Action: updateAdminProfile]', error);
    return {
      success: false,
      error: 'An unexpected error occurred while updating the profile.',
    };
  }
}

export async function verifyHospitalAction(
  hospitalId: string,
  action: 'approve' | 'reject' | 'pending',
) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user || session.user.role !== 'admin') {
    return { success: false, error: 'Unauthorized' };
  }

  await connectToDatabase();

  const newStatus =
    action === 'approve'
      ? 'verified'
      : action === 'reject'
        ? 'rejected'
        : 'pending';

  await Hospital.findByIdAndUpdate(hospitalId, {
    verificationStatus: newStatus,
    verifiedAt: newStatus === 'verified' ? new Date() : null,
    verifiedBy: newStatus === 'verified' ? session.user.id : null,
  });

  await Admin.findByIdAndUpdate(session.user.id, {
    $inc: { actionsLogged: 1 },
  });

  revalidatePath('/admin/verify-hospitals');
  revalidatePath('/admin/dashboard');

  return { success: true };
}

export async function toggleUserStatusAction(
  userId: string,
  isActive: boolean,
) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user || session.user.role !== 'admin') {
    return { success: false, error: 'Unauthorized' };
  }

  if (userId === session.user.id) {
    return {
      success: false,
      error: 'You cannot change your own account status.',
    };
  }

  await connectToDatabase();

  await User.findByIdAndUpdate(userId, {
    isActive,
  });

  await Admin.findByIdAndUpdate(session.user.id, {
    $inc: { actionsLogged: 1 },
  });

  revalidatePath('/admin/manage-users');
  revalidatePath('/admin/dashboard');

  return { success: true };
}
