'use server';

import { z } from 'zod';
import { BLOOD_GROUPS } from '@/types/common.type';

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
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 1000));

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
    // Here you would normally save to MongoDB
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
