'use server';

import { z } from 'zod';
import type { Types } from 'mongoose';
import { revalidatePath } from 'next/cache';
import { validateRoleAccess } from '@/lib/auth/guard';
import { connectToDatabase } from '@/lib/db/connect';
import { Donor } from '@/lib/models/donor.model';
import { Hospital } from '@/lib/models/hospital.model';
import { DonationRequest } from '@/lib/models/donation-request.model';
import {
  buildEligibleDonorNearSphereQuery,
  calculateDistanceKm,
  ensureGeoIndexOnce,
} from '@/lib/matching/blood-compatibility';
import {
  buildEmergencyPushPayload,
  dispatchPushAlerts,
} from '@/lib/notifications/push-alert';
import {
  dispatchEmergencyEmailAlerts,
  type DonorWithDistance,
} from '@/lib/notifications/email-alert';
import { BLOOD_GROUPS, type BloodGroup } from '@/types/common.type';
import { REQUEST_URGENCY_LEVEL } from '@/types/donor-request.type';

const DEFAULT_COLOMBO_COORDS: [number, number] = [79.8612, 6.9271];
const ALLOWED_RADII_KM = [5, 10, 20] as const;
const MAX_REQUEST_ID_ATTEMPTS = 5;

/**
 * Isolated emergency email recipient policy.
 *
 * PENDING TEAM CONFIRMATION:
 * `DonorSchema.emailAlertsEnabled` currently defaults to `false` (described in
 * Donor Profile as non-critical updates/reminders), whereas Issue #58 dispatches
 * emergency email alerts to matched donors. To avoid silently overriding donor
 * preferences, this filter currently respects `donor.emailAlertsEnabled === true`.
 * Update `ENFORCE_EMAIL_ALERTS_OPT_IN` in this single location once the team
 * confirms whether emergency alerts should bypass the opt-in flag.
 */
const ENFORCE_EMAIL_ALERTS_OPT_IN = true;

const createRequestSchema = z.object({
  bloodGroup: z.enum(BLOOD_GROUPS, {
    message: 'Please select a valid blood group.',
  }),
  quantity: z.coerce
    .number()
    .int('Quantity must be a whole number.')
    .min(1, 'Quantity must be at least 1 unit.')
    .max(20, 'Quantity cannot exceed 20 units per broadcast.'),
  radiusKm: z.coerce
    .number()
    .refine(
      (value): value is (typeof ALLOWED_RADII_KM)[number] =>
        ALLOWED_RADII_KM.includes(value as (typeof ALLOWED_RADII_KM)[number]),
      'Search radius must be 5, 10, or 20 km.',
    ),
  urgency: z.enum(REQUEST_URGENCY_LEVEL, {
    message: 'Please select a valid urgency level.',
  }),
  notes: z
    .string()
    .trim()
    .max(1000, 'Notes cannot exceed 1000 characters.')
    .default(''),
});

export type CreateDonationRequestState = {
  success: boolean;
  error?: string;
  fieldErrors?: Record<string, string[]>;
  requestId?: string;
  requestObjectId?: string;
  matchedCount?: number;
  radiusKm?: number;
  bloodGroup?: BloodGroup;
  pushSentCount?: number;
  pushAttemptedCount?: number;
  emailSentCount?: number;
  emailAttemptedCount?: number;
  emailOptedOutCount?: number;
  suggestExpandRadius?: boolean;
};

interface MatchedDonorRecord {
  _id: Types.ObjectId;
  fullName?: string;
  email?: string;
  emailAlertsEnabled?: boolean;
  location?: {
    coordinates?: number[];
  };
}

function normalizeCoordinates(coordinates?: number[] | null): [number, number] {
  if (
    Array.isArray(coordinates) &&
    coordinates.length === 2 &&
    Number.isFinite(coordinates[0]) &&
    Number.isFinite(coordinates[1])
  ) {
    return [coordinates[0], coordinates[1]];
  }
  return DEFAULT_COLOMBO_COORDS;
}

function selectEmergencyEmailRecipients(matchedDonors: MatchedDonorRecord[]): {
  recipients: MatchedDonorRecord[];
  optedOutCount: number;
} {
  const recipients: MatchedDonorRecord[] = [];
  let optedOutCount = 0;

  for (const donor of matchedDonors) {
    if (!donor.email?.trim()) {
      continue;
    }

    if (ENFORCE_EMAIL_ALERTS_OPT_IN && !donor.emailAlertsEnabled) {
      optedOutCount += 1;
      continue;
    }

    recipients.push(donor);
  }

  return { recipients, optedOutCount };
}

function generateRequestCode(attempt: number): string {
  if (attempt === 0) {
    return `REQ-${Date.now().toString().slice(-6)}`;
  }
  const randomSuffix = Math.floor(100000 + Math.random() * 900000).toString();
  return `REQ-${randomSuffix}`;
}

function isDuplicateKeyError(error: unknown): boolean {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    (error as { code?: unknown }).code === 11000
  );
}

/**
 * Hospital emergency blood request creation & multi-channel broadcast pipeline.
 * Matches nearby compatible, available, clinically eligible donors via `$nearSphere`
 * and dispatches Web Push + SMTP email alerts via `Promise.allSettled`.
 */
export async function createDonationRequest(
  _prevState: CreateDonationRequestState,
  formData: FormData,
): Promise<CreateDonationRequestState> {
  // Called outside try/catch so Next.js NEXT_REDIRECT propagates cleanly
  const session = await validateRoleAccess('hospital');

  const rawRadius = formData.get('radiusKm');
  const rawNotes = formData.get('notes');

  const rawData = {
    bloodGroup: formData.get('bloodGroup'),
    quantity: formData.get('quantity'),
    radiusKm:
      rawRadius === null || String(rawRadius).trim() === '' ? 10 : rawRadius,
    urgency: formData.get('urgency'),
    notes: typeof rawNotes === 'string' ? rawNotes : '',
  };

  const validated = createRequestSchema.safeParse(rawData);
  if (!validated.success) {
    const fieldErrors: Record<string, string[]> = {};
    for (const issue of validated.error.issues) {
      const key = String(issue.path[0] ?? 'form');
      if (!fieldErrors[key]) {
        fieldErrors[key] = [];
      }
      fieldErrors[key].push(issue.message);
    }

    return {
      success: false,
      error: 'Please review the highlighted request fields.',
      fieldErrors,
    };
  }

  try {
    await connectToDatabase();
    await ensureGeoIndexOnce('Donor', () => Donor.createIndexes());

    const { bloodGroup, quantity, radiusKm, urgency, notes } = validated.data;

    const hospital = await Hospital.findById(session.user.id)
      .select('name address hotline location verificationStatus')
      .lean();

    if (hospital?.verificationStatus !== 'verified') {
      return {
        success: false,
        error:
          'Your facility must be verified by an administrator before broadcasting emergency blood requests.',
      };
    }

    const hospitalName =
      hospital?.name?.trim() || session.user.name || 'Hospital Facility';
    const hospitalAddress = hospital?.address?.trim() || 'Colombo, Sri Lanka';
    const hospitalHotline = hospital?.hotline?.trim() || '';
    const hospitalCoordinates = normalizeCoordinates(
      hospital?.location?.coordinates,
    );

    const donorQuery = buildEligibleDonorNearSphereQuery({
      bloodGroup,
      hospitalCoordinates,
      radiusKm,
    });

    const eligibleDonors = (await Donor.find(donorQuery)
      .select('_id fullName email emailAlertsEnabled location')
      .limit(200)
      .lean()) as unknown as MatchedDonorRecord[];

    const matchedDonorIds = eligibleDonors.map((donor) => donor._id);

    let createdRequest: {
      _id: { toString(): string };
      requestId: string;
    } | null = null;

    for (let attempt = 0; attempt < MAX_REQUEST_ID_ATTEMPTS; attempt += 1) {
      const requestIdCode = generateRequestCode(attempt);
      try {
        const doc = await DonationRequest.create({
          requestId: requestIdCode,
          hospitalId: session.user.id,
          hospitalName,
          address: hospitalAddress,
          location: {
            type: 'Point',
            coordinates: hospitalCoordinates,
          },
          bloodGroup,
          quantity,
          urgency,
          status: 'pending',
          radiusKm,
          notes,
          matchedDonorsCount: eligibleDonors.length,
          notifiedDonors: matchedDonorIds,
        });

        createdRequest = {
          _id: doc._id,
          requestId: doc.requestId,
        };
        break;
      } catch (createError) {
        if (
          isDuplicateKeyError(createError) &&
          attempt < MAX_REQUEST_ID_ATTEMPTS - 1
        ) {
          continue;
        }
        throw createError;
      }
    }

    if (!createdRequest) {
      throw new Error('Failed to generate a unique request identifier.');
    }

    await Hospital.findByIdAndUpdate(session.user.id, {
      $inc: { activeRequestsCount: 1 },
    });

    const requestObjectId = createdRequest._id.toString();

    let pushSentCount = 0;
    let pushAttemptedCount = 0;
    let emailSentCount = 0;
    let emailAttemptedCount = 0;
    let emailOptedOutCount = 0;

    if (eligibleDonors.length > 0) {
      const pushPayload = buildEmergencyPushPayload({
        requestObjectId,
        requestId: createdRequest.requestId,
        bloodGroup,
        urgency,
        hospitalName,
        quantity,
      });

      const { recipients: emailRecipients, optedOutCount } =
        selectEmergencyEmailRecipients(eligibleDonors);
      emailOptedOutCount = optedOutCount;

      const donorsWithDistance: DonorWithDistance[] = emailRecipients.map(
        (donor) => ({
          donor: {
            _id: donor._id,
            fullName: donor.fullName,
            email: donor.email ?? '',
          },
          distanceKm: calculateDistanceKm(
            hospitalCoordinates,
            normalizeCoordinates(donor.location?.coordinates),
          ),
        }),
      );

      const [pushSettled, emailSettled] = await Promise.allSettled([
        dispatchPushAlerts({
          donorIds: matchedDonorIds,
          payload: pushPayload,
        }),
        dispatchEmergencyEmailAlerts({
          donorsWithDistance,
          request: {
            _id: requestObjectId,
            requestId: createdRequest.requestId,
            bloodGroup,
            quantity,
            urgency,
            notes,
          },
          hospital: {
            name: hospitalName,
            address: hospitalAddress,
            hotline: hospitalHotline,
          },
        }),
      ]);

      if (pushSettled.status === 'fulfilled') {
        pushSentCount = pushSettled.value.sent;
        pushAttemptedCount = pushSettled.value.attempted;
      } else {
        console.error(
          '[Action: createDonationRequest] Push dispatch error:',
          pushSettled.reason instanceof Error
            ? pushSettled.reason.message
            : 'Unknown error',
        );
      }

      if (emailSettled.status === 'fulfilled') {
        emailSentCount = emailSettled.value.sent;
        emailAttemptedCount = emailSettled.value.attempted;
      } else {
        console.error(
          '[Action: createDonationRequest] Email dispatch error:',
          emailSettled.reason instanceof Error
            ? emailSettled.reason.message
            : 'Unknown error',
        );
      }
    }

    revalidatePath('/hospital/dashboard');
    revalidatePath('/hospital/tracking');
    revalidatePath('/donor/dashboard');
    revalidatePath('/donor/requests');

    return {
      success: true,
      requestId: createdRequest.requestId,
      requestObjectId,
      matchedCount: eligibleDonors.length,
      radiusKm,
      bloodGroup,
      pushSentCount,
      pushAttemptedCount,
      emailSentCount,
      emailAttemptedCount,
      emailOptedOutCount,
      suggestExpandRadius: eligibleDonors.length === 0 && radiusKm < 20,
    };
  } catch (error) {
    console.error(
      '[Action: createDonationRequest]',
      error instanceof Error ? error.message : 'Unknown error',
    );
    return {
      success: false,
      error:
        'An unexpected error occurred while broadcasting your blood request. Please try again.',
    };
  }
}
