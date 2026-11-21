'use server';

import mongoose from 'mongoose';
import { z } from 'zod';
import { headers } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { HOSPITAL_TYPE } from '@/types/hospital.type';
import { connectToDatabase } from '@/lib/db/connect';
import { Hospital } from '@/lib/models/hospital.model';
import { Donor } from '@/lib/models/donor.model';
import { User } from '@/lib/models/user.model';
import { auth } from '@/lib/auth/config';
import { verifyProfileLocationCapture } from '@/lib/location/profile-location';

// Zod Schema based on HospitalEntity Form requirements
const hospitalSchema = z.object({
  name: z.string().trim().min(2, 'Facility name must be at least 2 characters'),
  facilityType: z.enum(HOSPITAL_TYPE as unknown as [string, ...string[]]),
  website: z
    .string()
    .trim()
    .url('Invalid website URL')
    .optional()
    .or(z.literal('')),
  hotline: z.string().trim().min(9, 'Hotline number is required'),
  address: z.string().trim().min(5, 'Full street address is required'),
  city: z.string().trim().min(2, 'City is required'),
  latitude: z.coerce.number().min(-90).max(90),
  longitude: z.coerce.number().min(-180).max(180),
  coordinatorName: z.string().trim().min(2, 'Coordinator name is required'),
  coordinatorDesignation: z
    .string()
    .trim()
    .min(2, 'Coordinator designation is required'),
  coordinatorContactNumber: z
    .string()
    .trim()
    .min(9, 'Coordinator contact is required'),
  coordinatorEmail: z
    .string()
    .trim()
    .email('Invalid coordinator email address'),
});

export type HospitalActionState = {
  success?: boolean;
  error?: string;
  fieldErrors?: Record<string, string[]>;
};

export async function updateHospitalProfile(
  prevState: HospitalActionState,
  formData: FormData,
): Promise<HospitalActionState> {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user || session.user.role !== 'hospital') {
    return {
      success: false,
      error: 'You must be logged in as a hospital to update this profile.',
    };
  }

  const rawData = {
    name: formData.get('name'),
    facilityType: formData.get('facilityType'),
    website: formData.get('website'),
    hotline: formData.get('hotline'),
    address: formData.get('address'),
    city: formData.get('city'),
    latitude: formData.get('latitude'),
    longitude: formData.get('longitude'),
    coordinatorName: formData.get('coordinatorName'),
    coordinatorDesignation: formData.get('coordinatorDesignation'),
    coordinatorContactNumber: formData.get('coordinatorContactNumber'),
    coordinatorEmail: formData.get('coordinatorEmail'),
  };

  const validatedData = hospitalSchema.safeParse(rawData);

  if (!validatedData.success) {
    const fieldErrors: Record<string, string[]> = {};
    validatedData.error.issues.forEach((issue) => {
      const field = String(issue.path[0]);
      if (!fieldErrors[field]) fieldErrors[field] = [];
      fieldErrors[field].push(issue.message);
    });

    return {
      success: false,
      error: 'Please fix the errors in the form.',
      fieldErrors,
    };
  }

  try {
    await connectToDatabase();

    const locationCaptured = formData.get('locationCaptured') === 'true';
    const existingHospital = await Hospital.findById(session.user.id)
      .select('lastLocationUpdatedAt')
      .lean();

    const locationCheck = await verifyProfileLocationCapture({
      userId: session.user.id,
      locationCaptured,
      existingLastLocationUpdatedAt: existingHospital?.lastLocationUpdatedAt,
    });

    if (!locationCheck.allowed) {
      return {
        success: false,
        error: locationCheck.error,
        fieldErrors: locationCheck.fieldErrors,
      };
    }

    const data = validatedData.data;
    const lockedEmail = session.user.email;

    await Hospital.findByIdAndUpdate(
      session.user.id,
      {
        name: data.name,
        facilityType: data.facilityType,
        website: data.website || '',
        hotline: data.hotline,
        email: lockedEmail,
        address: data.address,
        city: data.city,
        location: {
          type: 'Point',
          coordinates: [data.longitude, data.latitude],
        },
        lastLocationUpdatedAt: locationCheck.nextLocationUpdatedAt,
        coordinator: {
          name: data.coordinatorName,
          designation: data.coordinatorDesignation,
          contactNumber: data.coordinatorContactNumber,
          email: data.coordinatorEmail,
        },
      },
      {
        upsert: true,
        returnDocument: 'after',
        setDefaultsOnInsert: true,
      },
    );

    await User.findByIdAndUpdate(session.user.id, {
      name: data.name,
      isActive: true,
    });

    revalidatePath('/hospital', 'layout');
    revalidatePath('/hospital/profile');
    revalidatePath('/hospital/dashboard');
    revalidatePath('/hospital/donors');
    revalidatePath('/hospital/post-request');
    revalidatePath('/hospital/tracking');

    return {
      success: true,
    };
  } catch (error: unknown) {
    console.error('[Action: updateHospitalProfile]', error);
    return {
      success: false,
      error: 'An unexpected error occurred while updating the profile.',
    };
  }
}

export async function toggleDonorVerification(
  donorId: string,
  newStatus: boolean,
) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user || session.user.role !== 'hospital') {
    return { success: false, error: 'Unauthorized' };
  }

  if (!mongoose.Types.ObjectId.isValid(donorId)) {
    return { success: false, error: 'Invalid donor identifier.' };
  }

  if (typeof newStatus !== 'boolean') {
    return { success: false, error: 'Invalid verification status.' };
  }

  try {
    await connectToDatabase();

    // Always verify live DB activation and hospital verification status
    const [user, hospital] = await Promise.all([
      User.findById(session.user.id).select('isActive').lean(),
      Hospital.findById(session.user.id).select('verificationStatus').lean(),
    ]);

    if (!user?.isActive) {
      return {
        success: false,
        error:
          'Your facility account is deactivated. Please complete your profile to activate your account.',
      };
    }

    if (hospital?.verificationStatus !== 'verified') {
      return {
        success: false,
        error:
          'Your facility must be verified by an administrator before updating donor eligibility.',
      };
    }

    const updated = await Donor.findByIdAndUpdate(donorId, {
      isEligible: newStatus,
    });

    if (!updated) {
      return { success: false, error: 'Donor record not found.' };
    }

    revalidatePath('/hospital/donors');
    return { success: true };
  } catch (error: unknown) {
    console.error('[Action: toggleDonorVerification]', error);
    return {
      success: false,
      error: 'Failed to update donor eligibility status.',
    };
  }
}
