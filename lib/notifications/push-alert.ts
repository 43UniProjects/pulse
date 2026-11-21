import type { Types } from 'mongoose';
import {
  sendNotification,
  setVapidDetails,
  type PushSubscription as WebPushSubscription,
  type RequestOptions,
} from 'web-push';
import { PushSubscription } from '@/lib/models/push-subscription.model';
import type { BloodGroup } from '@/types/common.type';
import type { RequestUrgency } from '@/types/donor-request.type';

export interface PushAlertPayload {
  title: string;
  body: string;
  urgency: RequestUrgency;
  bloodGroup: BloodGroup;
  hospitalName: string;
  requestId: string;
  url: string;
  icon: string;
  badge: string;
  tag: string;
}

export interface BuildPushAlertPayloadParams {
  requestObjectId: string;
  requestId: string;
  bloodGroup: BloodGroup;
  urgency: RequestUrgency;
  hospitalName: string;
  quantity?: number;
}

export interface DispatchPushAlertsParams {
  donorIds: Array<string | { toString(): string }>;
  payload: PushAlertPayload;
}

export interface PushDispatchResult {
  attempted: number;
  sent: number;
  failed: number;
  removedStale: number;
  skipped?: boolean;
}

const EMERGENCY_PUSH_TTL_SECONDS = 3600;
const STALE_HTTP_STATUS_CODES = new Set([404, 410]);

let configuredVapidSignature: string | null = null;

/**
 * Lazily configures Web Push VAPID details at runtime (never at module load)
 * so Docker builds without `.env.local` never fail during `next build`.
 */
export function ensureVapidConfigured(): boolean {
  const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY?.trim();
  const privateKey = process.env.VAPID_PRIVATE_KEY?.trim();
  const subject = process.env.VAPID_SUBJECT?.trim();

  if (!publicKey || !privateKey || !subject) {
    console.warn(
      '[PushAlert] VAPID environment variables are missing; skipping Web Push dispatch.',
    );
    return false;
  }

  const signature = `${subject}:${publicKey}:${privateKey.length}`;
  if (configuredVapidSignature === signature) {
    return true;
  }

  try {
    setVapidDetails(subject, publicKey, privateKey);
    configuredVapidSignature = signature;
    return true;
  } catch (error) {
    console.error(
      '[PushAlert] Invalid VAPID configuration:',
      error instanceof Error ? error.message : 'Unknown error',
    );
    return false;
  }
}

/**
 * Resets cached VAPID configuration state (intended for unit tests).
 */
export function resetVapidConfigCacheForTests(): void {
  configuredVapidSignature = null;
}

/**
 * Builds the standardized Web Push JSON payload consumed by `public/sw.js`.
 */
export function buildEmergencyPushPayload({
  requestObjectId,
  requestId,
  bloodGroup,
  urgency,
  hospitalName,
  quantity,
}: BuildPushAlertPayloadParams): PushAlertPayload {
  const urgencyLabel =
    urgency === 'critical'
      ? 'CRITICAL'
      : urgency === 'high'
        ? 'URGENT'
        : 'BLOOD REQUEST';

  const unitsText =
    typeof quantity === 'number' && quantity > 0
      ? `${quantity} unit${quantity === 1 ? '' : 's'} of `
      : '';

  return {
    title: `${urgencyLabel}: ${bloodGroup} Blood Needed`,
    body: `${hospitalName} needs ${unitsText}${bloodGroup} blood (${requestId}). Tap to view and respond.`,
    urgency,
    bloodGroup,
    hospitalName,
    requestId,
    url: `/donor/requests/${requestObjectId}`,
    icon: '/logo/logo.png',
    badge: '/logo/logo.png',
    tag: `pulse-request-${requestObjectId}`,
  };
}

function getPushErrorStatusCode(reason: unknown): number | null {
  if (
    typeof reason === 'object' &&
    reason !== null &&
    'statusCode' in reason &&
    typeof (reason as { statusCode: unknown }).statusCode === 'number'
  ) {
    return (reason as { statusCode: number }).statusCode;
  }
  return null;
}

/**
 * Dispatches Web Push notifications to all stored subscriptions for `donorIds`
 * using `Promise.allSettled`, automatically deleting stale `404`/`410` endpoints.
 */
export async function dispatchPushAlerts({
  donorIds,
  payload,
}: DispatchPushAlertsParams): Promise<PushDispatchResult> {
  if (donorIds.length === 0) {
    return { attempted: 0, sent: 0, failed: 0, removedStale: 0 };
  }

  if (!ensureVapidConfigured()) {
    return {
      attempted: 0,
      sent: 0,
      failed: 0,
      removedStale: 0,
      skipped: true,
    };
  }

  const normalizedDonorIds = donorIds.map((id) => id.toString());

  const subscriptions = await PushSubscription.find({
    donorId: { $in: normalizedDonorIds },
  }).lean();

  if (subscriptions.length === 0) {
    return { attempted: 0, sent: 0, failed: 0, removedStale: 0 };
  }

  const serializedPayload = JSON.stringify(payload);
  const requestOptions: RequestOptions = {
    TTL: EMERGENCY_PUSH_TTL_SECONDS,
    urgency: payload.urgency === 'normal' ? 'normal' : 'high',
  };

  const results = await Promise.allSettled(
    subscriptions.map((sub) => {
      const target: WebPushSubscription = {
        endpoint: sub.endpoint,
        expirationTime: sub.expirationTime ?? null,
        keys: {
          p256dh: sub.keys.p256dh,
          auth: sub.keys.auth,
        },
      };
      return sendNotification(target, serializedPayload, requestOptions);
    }),
  );

  let sent = 0;
  let failed = 0;
  const staleIds: Array<Types.ObjectId | string> = [];

  results.forEach((result, index) => {
    if (result.status === 'fulfilled') {
      sent += 1;
      return;
    }

    failed += 1;
    const statusCode = getPushErrorStatusCode(result.reason);
    if (statusCode !== null && STALE_HTTP_STATUS_CODES.has(statusCode)) {
      staleIds.push(subscriptions[index]._id);
    } else {
      console.error(
        `[PushAlert] Failed to send push notification (status=${statusCode ?? 'unknown'}):`,
        result.reason instanceof Error
          ? result.reason.message
          : 'Unknown error',
      );
    }
  });

  let removedStale = 0;
  if (staleIds.length > 0) {
    try {
      await PushSubscription.deleteMany({ _id: { $in: staleIds } });
      removedStale = staleIds.length;
    } catch (cleanupError) {
      console.error(
        '[PushAlert] Failed to delete stale push subscriptions:',
        cleanupError instanceof Error ? cleanupError.message : 'Unknown error',
      );
    }
  }

  return {
    attempted: subscriptions.length,
    sent,
    failed,
    removedStale,
  };
}
