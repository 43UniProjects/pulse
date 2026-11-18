'use server';

import { z } from 'zod';
import { headers } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { BLOOD_GROUPS } from '@/types/common.type';
import { connectToDatabase } from '@/lib/db/connect';
import { Donor } from '@/lib/models/donor.model';
import { User } from '@/lib/models/user.model';
import { auth } from '@/lib/auth/config';

// Zod Schema based on DonorEntity
const donorSchema = z.object({
  fullName: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(10, 'Phone number is required'),
  bloodGroup: z.enum(BLOOD_GROUPS as unknown as [string, ...string[]]),
  address: z.string().min(5, 'Address is required'),
  latitude: z.coerce.number().min(-90).max(90),
  longitude: z.coerce.number().min(-180).max(180),
  radiusPreferenceKm: z.coerce.number().min(1).max(100),
  isAvailable: z.coerce.boolean().default(false),
  liveLocationSync: z.coerce.boolean().default(false),
  smsAlertsEnabled: z.coerce.boolean().default(false),
  emailAlertsEnabled: z.coerce.boolean().default(false),
});

export type ActionState = {
  success?: boolean;
  error?: string;
  fieldErrors?: Record<string, string[]>;
};

export async function updateDonorProfile(
  prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user || session.user.role !== 'donor') {
    return {
      success: false,
      error: 'You must be logged in as a donor to update your profile.',
    };
  }

  const rawData = {
    fullName: formData.get('fullName'),
    email: formData.get('email'),
    phone: formData.get('phone'),
    bloodGroup: formData.get('bloodGroup'),
    address: formData.get('address'),
    latitude: formData.get('latitude'),
    longitude: formData.get('longitude'),
    radiusPreferenceKm: formData.get('radiusPreferenceKm'),
    isAvailable: formData.get('isAvailable') === 'true',
    liveLocationSync: formData.get('liveLocationSync') === 'true',
    smsAlertsEnabled: formData.get('smsAlertsEnabled') === 'true',
    emailAlertsEnabled: formData.get('emailAlertsEnabled') === 'true',
  };

  const validatedData = donorSchema.safeParse(rawData);

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

    const {
      fullName,
      email,
      phone,
      bloodGroup,
      address,
      latitude,
      longitude,
      radiusPreferenceKm,
      isAvailable,
      liveLocationSync,
      smsAlertsEnabled,
      emailAlertsEnabled,
    } = validatedData.data;

    await Donor.findByIdAndUpdate(
      session.user.id,
      {
        fullName,
        email,
        phone,
        bloodGroup,
        address,
        location: {
          type: 'Point',
          coordinates: [longitude, latitude],
        },
        radiusPreferenceKm,
        isAvailable,
        liveLocationSync,
        smsAlertsEnabled,
        emailAlertsEnabled,
      },
      {
        upsert: true,
        new: true,
        setDefaultsOnInsert: true,
      },
    );

    await User.findByIdAndUpdate(session.user.id, {
      name: fullName,
    });

    revalidatePath('/donor/profile');
    revalidatePath('/donor/dashboard');

    return {
      success: true,
    };
  } catch (error: unknown) {
    console.error('[Action: updateDonorProfile]', error);
    return {
      success: false,
      error: 'An unexpected error occurred while updating the profile.',
    };
  }
}
