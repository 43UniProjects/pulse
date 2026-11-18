'use server';

import { z } from 'zod';
import { headers } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { HOSPITAL_TYPE } from '@/types/hospital.type';
import { BLOOD_GROUPS } from '@/types/common.type';
import { REQUEST_URGENCY_LEVEL } from '@/types/donor-request.type';
import { connectToDatabase } from '@/lib/db/connect';
import { Hospital } from '@/lib/models/hospital.model';
import { Donor } from '@/lib/models/donor.model';
import { DonationRequest } from '@/lib/models/donation-request.model';
import { User } from '@/lib/models/user.model';
import { auth } from '@/lib/auth/config';

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
    await connectToDatabase();

    const data = validatedData.data;

    await Hospital.findByIdAndUpdate(
      session.user.id,
      {
        name: data.name,
        facilityType: data.facilityType,
        website: data.website || undefined,
        hotline: data.hotline,
        email: data.email,
        address: data.address,
        city: data.city,
        location: {
          type: 'Point',
          coordinates: [data.longitude, data.latitude],
        },
        coordinator: {
          name: data.coordinatorName,
          designation: data.coordinatorDesignation,
          contactNumber: data.coordinatorContactNumber,
          email: data.coordinatorEmail,
        },
      },
      {
        upsert: true,
        new: true,
        setDefaultsOnInsert: true,
      },
    );

    await User.findByIdAndUpdate(session.user.id, {
      name: data.name,
    });

    revalidatePath('/hospital/profile');
    revalidatePath('/hospital/dashboard');

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

const postRequestSchema = z.object({
  bloodGroup: z.enum(BLOOD_GROUPS as unknown as [string, ...string[]]),
  quantity: z.coerce.number().min(1).max(20),
  radiusKm: z.coerce.number().default(10),
  urgency: z.enum(REQUEST_URGENCY_LEVEL as unknown as [string, ...string[]]),
  notes: z.string().optional().default(''),
});

export async function createHospitalDonationRequest(formData: FormData) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user || session.user.role !== 'hospital') {
    throw new Error('Unauthorized');
  }

  const rawData = {
    bloodGroup: formData.get('bloodGroup'),
    quantity: formData.get('quantity'),
    radiusKm: formData.get('radiusKm'),
    urgency: formData.get('urgency'),
    notes: formData.get('notes'),
  };

  const validated = postRequestSchema.safeParse(rawData);
  if (!validated.success) {
    throw new Error('Invalid request parameters');
  }

  await connectToDatabase();

  const hospital = await Hospital.findById(session.user.id).lean();
  const hospitalName =
    hospital?.name || session.user.name || 'Hospital Facility';
  const hospitalAddress = hospital?.address || 'Colombo, Sri Lanka';
  const hospitalLocation = hospital?.location || {
    type: 'Point',
    coordinates: [79.8612, 6.9271],
  };

  const requestIdCode = `REQ-${Date.now().toString().slice(-6)}`;

  await DonationRequest.create({
    requestId: requestIdCode,
    hospitalId: session.user.id,
    hospitalName,
    address: hospitalAddress,
    location: hospitalLocation,
    bloodGroup: validated.data.bloodGroup,
    quantity: validated.data.quantity,
    urgency: validated.data.urgency,
    status: 'pending',
    radiusKm: validated.data.radiusKm,
    notes: validated.data.notes,
  });

  await Hospital.findByIdAndUpdate(session.user.id, {
    $inc: { activeRequestsCount: 1 },
  });

  revalidatePath('/hospital/dashboard');
  redirect('/hospital/dashboard');
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

  await connectToDatabase();

  await Donor.findByIdAndUpdate(donorId, {
    isEligible: newStatus,
  });

  revalidatePath('/hospital/donors');
  return { success: true };
}
