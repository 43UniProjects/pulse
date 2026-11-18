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
  fullName: z.string().trim().min(2, 'Full name must be at least 2 characters'),
  phone: z
    .string()
    .trim()
    .min(9, 'Phone number is required (at least 9 digits)'),
  bloodGroup: z.enum(BLOOD_GROUPS as unknown as [string, ...string[]], {
    message: 'Please select your blood group',
  }),
  dateOfBirth: z
    .string()
    .min(1, 'Date of birth is required')
    .refine((val) => {
      const parsed = new Date(val);
      return !isNaN(parsed.getTime()) && parsed < new Date();
    }, 'Date of birth must be a valid past date'),
  address: z
    .string()
    .trim()
    .min(5, 'Address is required (at least 5 characters)'),
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
    phone: formData.get('phone'),
    bloodGroup: formData.get('bloodGroup'),
    dateOfBirth: formData.get('dateOfBirth'),
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
      phone,
      bloodGroup,
      dateOfBirth,
      address,
      latitude,
      longitude,
      radiusPreferenceKm,
      isAvailable,
      liveLocationSync,
      smsAlertsEnabled,
      emailAlertsEnabled,
    } = validatedData.data;

    // Strict lock: enforce user's authenticated email
    const lockedEmail = session.user.email;

    await Donor.findByIdAndUpdate(
      session.user.id,
      {
        fullName,
        email: lockedEmail,
        phone,
        bloodGroup,
        dateOfBirth: new Date(dateOfBirth),
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
      isActive: true,
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
