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
  message?: string;
  errors?: Record<string, string[]>;
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
    return {
      success: false,
      message: 'Please fix the errors in the form.',
      errors: validatedData.error.flatten().fieldErrors,
    };
  }

  // Here you would normally save to MongoDB

  return {
    success: true,
    message: 'Profile updated successfully!',
  };
}
