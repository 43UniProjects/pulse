'use server';

import { z } from 'zod';
import { HOSPITAL_TYPE } from '@/types/hospital.type';

// Zod Schema based on HospitalEntity Form requirements
const hospitalSchema = z.object({
  name: z.string().min(2, 'Facility name must be at least 2 characters'),
  facilityType: z.enum(HOSPITAL_TYPE as unknown as [string, ...string[]]),
  website: z.string().url('Invalid website URL').optional().or(z.literal('')),
  hotline: z.string().min(9, 'Hotline number is required'),
  email: z.string().email('Invalid department email address'),
  address: z.string().min(5, 'Full address is required'),
  city: z.string().min(2, 'City is required'),
  latitude: z.coerce.number().min(-90).max(90),
  longitude: z.coerce.number().min(-180).max(180),
  coordinatorName: z.string().min(2, 'Coordinator name is required'),
  coordinatorDesignation: z
    .string()
    .min(2, 'Coordinator designation is required'),
  coordinatorContactNumber: z
    .string()
    .min(9, 'Coordinator contact is required'),
  coordinatorEmail: z.string().email('Invalid coordinator email address'),
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
  // Simulate network delay for pending state
  await new Promise((resolve) => setTimeout(resolve, 1000));

  const rawData = {
    name: formData.get('name'),
    facilityType: formData.get('facilityType'),
    website: formData.get('website'),
    hotline: formData.get('hotline'),
    email: formData.get('email'),
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
    // Here you would normally connect to DB and update the Hospital collection
    // using the _id from the authenticated session.
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
