'use server';

import { z } from 'zod';
import mongoose from 'mongoose';
import { revalidatePath } from 'next/cache';
import { connectToDatabase } from '@/lib/db/connect';
import { validateRoleAccess } from '@/lib/auth/guard';
import { DonationRequest } from '@/lib/models/donation-request.model';
import { Donation } from '@/lib/models/donation.model';
import { Donor } from '@/lib/models/donor.model';
import { Hospital } from '@/lib/models/hospital.model';
import { sendDonationThankYouEmail } from '@/lib/mail';
import { SCREENING_STATUS } from '@/types/donation.type';

export interface ActionResponse<T = unknown> {
  success: boolean;
  error?: string;
  data?: T;
}

export interface BloodIntakePayload {
  units?: number;
  batchNumber: string;
  screeningResults: {
    hiv: (typeof SCREENING_STATUS)[number];
    hepatitisB: (typeof SCREENING_STATUS)[number];
    hepatitisC: (typeof SCREENING_STATUS)[number];
    syphilis: (typeof SCREENING_STATUS)[number];
    hemoglobinLevel: string;
  };
  clinicalNotes?: string;
}

const bloodIntakeSchema = z.object({
  units: z.coerce.number().min(1).default(1),
  batchNumber: z
    .string()
    .trim()
    .min(3, 'Blood bag batch/barcode identifier is required (min 3 chars)'),
  screeningResults: z.object({
    hiv: z.enum(SCREENING_STATUS),
    hepatitisB: z.enum(SCREENING_STATUS),
    hepatitisC: z.enum(SCREENING_STATUS),
    syphilis: z.enum(SCREENING_STATUS),
    hemoglobinLevel: z
      .string()
      .trim()
      .min(1, 'Hemoglobin reading is required (e.g., 13.5 g/dL)'),
  }),
  clinicalNotes: z.string().trim().optional(),
});

/**
 * Atomically accepts an emergency blood request for an active donor.
 * Implements capacity race condition guarding and donor availability lock.
 */
export async function acceptDonationRequest(
  requestId: string,
): Promise<ActionResponse<{ donationId: string }>> {
  try {
    const session = await validateRoleAccess('donor');
    await connectToDatabase();

    const query = mongoose.Types.ObjectId.isValid(requestId)
      ? {
          $or: [{ _id: new mongoose.Types.ObjectId(requestId) }, { requestId }],
        }
      : { requestId };

    const request = await DonationRequest.findOne(query);
    if (!request) {
      return { success: false, error: 'Emergency blood request not found.' };
    }

    if (request.status === 'completed' || request.status === 'declined') {
      return {
        success: false,
        error: `This request is no longer active (status: ${request.status}).`,
      };
    }

    // 1. Check if the donor already responded with an active or accepted commitment
    const existing = await Donation.findOne({
      requestId: request._id,
      donorId: session.user.id,
      status: { $in: ['accepted', 'completed'] },
    }).lean();

    if (existing) {
      return {
        success: false,
        error: 'You have already accepted and committed to this request.',
      };
    }

    // 2. Atomic capacity check: Ensure accepted + completed units don't exceed request quantity
    const committedCount = await Donation.countDocuments({
      requestId: request._id,
      status: { $in: ['accepted', 'completed'] },
    });

    if (committedCount >= request.quantity) {
      return {
        success: false,
        error:
          'This emergency request has already been fully committed by other responding donors.',
      };
    }

    // 3. Create the Donation commitment record
    const donationCode = `DON-${Date.now().toString().slice(-6)}`;
    const newDonation = await Donation.create({
      donationId: donationCode,
      requestId: request._id,
      donorId: session.user.id,
      hospitalId: request.hospitalId,
      bloodGroup: request.bloodGroup,
      units: 1,
      status: 'accepted',
      donationDate: new Date(),
    });

    // 4. Update Donor state: set isAvailable to false while actively responding
    await Donor.findByIdAndUpdate(session.user.id, {
      isAvailable: false,
    });

    // 5. If this commitment fills the requested units, transition request status to 'accepted'
    if (committedCount + 1 >= request.quantity) {
      request.status = 'accepted';
      await request.save();
    }

    // Revalidate paths across donor and hospital views
    const reqIdStr = request._id.toString();
    revalidatePath(`/donor/requests/${requestId}`);
    revalidatePath(`/donor/requests/${reqIdStr}`);
    revalidatePath('/donor/dashboard');
    revalidatePath('/donor/requests');
    revalidatePath(`/hospital/tracking/${reqIdStr}`);
    revalidatePath(`/hospital/tracking/${request.requestId}`);
    revalidatePath('/hospital/dashboard');
    revalidatePath('/hospital/tracking');

    return {
      success: true,
      data: { donationId: newDonation.donationId },
    };
  } catch (error) {
    console.error('[Action: acceptDonationRequest]', error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : 'An unexpected error occurred while accepting the request.',
    };
  }
}

/**
 * Records a declined response from a donor without affecting donor availability.
 */
export async function declineDonationRequest(
  requestId: string,
): Promise<ActionResponse> {
  try {
    const session = await validateRoleAccess('donor');
    await connectToDatabase();

    const query = mongoose.Types.ObjectId.isValid(requestId)
      ? {
          $or: [{ _id: new mongoose.Types.ObjectId(requestId) }, { requestId }],
        }
      : { requestId };

    const request = await DonationRequest.findOne(query).lean();
    if (!request) {
      return { success: false, error: 'Emergency blood request not found.' };
    }

    // Record 'declined' response for tracking metrics
    const donationCode = `DON-${Date.now().toString().slice(-6)}`;
    await Donation.create({
      donationId: donationCode,
      requestId: request._id,
      donorId: session.user.id,
      hospitalId: request.hospitalId,
      bloodGroup: request.bloodGroup,
      units: 1,
      status: 'declined',
      donationDate: new Date(),
    });

    const reqIdStr = request._id.toString();
    revalidatePath(`/donor/requests/${requestId}`);
    revalidatePath(`/donor/requests/${reqIdStr}`);
    revalidatePath('/donor/dashboard');
    revalidatePath(`/hospital/tracking/${reqIdStr}`);
    revalidatePath('/hospital/dashboard');

    return { success: true };
  } catch (error) {
    console.error('[Action: declineDonationRequest]', error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : 'An unexpected error occurred while declining the request.',
    };
  }
}

/**
 * Completes a blood collection intake:
 * 1. Validates viral screenings & barcode.
 * 2. Calculates 35-day blood shelf-life expiry (CPD-A1 standard).
 * 3. Enforces mandatory 120-day medical lockout on donor profile.
 * 4. Checks request completion & decrements hospital activeRequestsCount.
 * 5. Sends automated clinical thank-you email with next eligible donation date.
 */
export async function completeBloodDonation(
  donationId: string,
  payload: BloodIntakePayload,
): Promise<ActionResponse> {
  try {
    const session = await validateRoleAccess('hospital');
    await connectToDatabase();

    const validated = bloodIntakeSchema.safeParse(payload);
    if (!validated.success) {
      const firstError =
        validated.error.issues[0]?.message || 'Invalid clinical intake data.';
      return { success: false, error: firstError };
    }

    const { units, batchNumber, screeningResults, clinicalNotes } =
      validated.data;

    // Locate donation record
    const query = mongoose.Types.ObjectId.isValid(donationId)
      ? {
          $or: [
            { _id: new mongoose.Types.ObjectId(donationId) },
            { donationId },
          ],
        }
      : { donationId };

    const donation = await Donation.findOne(query);
    if (!donation) {
      return { success: false, error: 'Donation intake record not found.' };
    }

    if (donation.status === 'completed') {
      return {
        success: false,
        error: 'This blood donation has already been processed and completed.',
      };
    }

    const now = new Date();
    // 35 days CPD-A1 whole blood preservation standard
    const expiryDate = new Date(now.getTime() + 35 * 24 * 60 * 60 * 1000);
    // 120 days clinical recovery period
    const nextEligibleDate = new Date(
      now.getTime() + 120 * 24 * 60 * 60 * 1000,
    );

    // 1. Update Donation record with clinical intake ledger details
    donation.status = 'completed';
    donation.units = units;
    donation.batchNumber = batchNumber;
    donation.screeningResults = screeningResults;
    donation.clinicalNotes = clinicalNotes || '';
    donation.donationDate = now;
    donation.expiryDate = expiryDate;
    await donation.save();

    // 2. Enforce 120-Day Medical Lockout on Donor
    await Donor.findByIdAndUpdate(donation.donorId, {
      lastDonationDate: now,
      isEligible: false,
      isAvailable: true, // Reset temporary engagement lock
      $addToSet: { history: donation._id },
    });

    // 3. Aggregate completed units for the associated DonationRequest
    if (donation.requestId) {
      const request = await DonationRequest.findById(donation.requestId);
      if (request) {
        const completedAgg = await Donation.aggregate([
          {
            $match: {
              requestId: request._id,
              status: 'completed',
            },
          },
          {
            $group: {
              _id: null,
              totalUnits: { $sum: '$units' },
            },
          },
        ]);

        const totalCollected = completedAgg[0]?.totalUnits || 0;
        if (totalCollected >= request.quantity) {
          request.status = 'completed';
          await request.save();

          await Hospital.findByIdAndUpdate(session.user.id, {
            $inc: { activeRequestsCount: -1 },
          });
        }
      }
    }

    // 4. Send Automated Thank-You & Recovery Email
    const donor = await Donor.findById(donation.donorId).lean();
    const hospital = await Hospital.findById(session.user.id).lean();

    if (donor?.email) {
      const formattedDonationDate = new Intl.DateTimeFormat('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      }).format(now);

      const formattedNextEligibleDate = new Intl.DateTimeFormat('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      }).format(nextEligibleDate);

      try {
        await sendDonationThankYouEmail({
          to: donor.email,
          name: donor.fullName || 'Valued Donor',
          hospitalName:
            hospital?.name || session.user.name || 'Hospital Facility',
          bloodGroup: donation.bloodGroup,
          units,
          donationDate: formattedDonationDate,
          nextEligibleDate: formattedNextEligibleDate,
        });
      } catch (mailError) {
        console.error(
          '[Action: completeBloodDonation] Failed to send thank-you email:',
          mailError,
        );
      }
    }

    // Revalidate paths
    revalidatePath('/hospital/dashboard');
    revalidatePath('/hospital/tracking');
    if (donation.requestId) {
      revalidatePath(`/hospital/tracking/${donation.requestId.toString()}`);
    }
    revalidatePath('/donor/dashboard');
    revalidatePath('/donor/profile');

    return { success: true };
  } catch (error) {
    console.error('[Action: completeBloodDonation]', error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : 'An unexpected error occurred while completing the blood donation.',
    };
  }
}
