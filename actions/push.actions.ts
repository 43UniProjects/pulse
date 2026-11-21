'use server';

import { z } from 'zod';
import { headers } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { auth } from '@/lib/auth/config';
import { connectToDatabase } from '@/lib/db/connect';
import { User } from '@/lib/models/user.model';
import { PushSubscription } from '@/lib/models/push-subscription.model';
import type { SerializedPushSubscription } from '@/types/push-subscription.type';

const pushSubscriptionSchema = z.object({
  endpoint: z
    .string()
    .trim()
    .url('Invalid push subscription endpoint URL')
    .max(2048, 'Push subscription endpoint is too long'),
  expirationTime: z.number().nullable().optional(),
  keys: z.object({
    p256dh: z.string().trim().min(1, 'Missing p256dh subscription key'),
    auth: z.string().trim().min(1, 'Missing auth subscription key'),
  }),
});

const endpointSchema = z
  .string()
  .trim()
  .url('Invalid push subscription endpoint URL')
  .max(2048, 'Push subscription endpoint is too long');

const userAgentSchema = z.string().trim().max(512).optional().default('');

export interface PushActionResult {
  success: boolean;
  error?: string;
}

export interface PushSubscriptionStatusResult extends PushActionResult {
  subscribed: boolean;
}

async function getActiveDonorSession(): Promise<
  { ok: true; donorId: string } | { ok: false; error: string }
> {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user || session.user.role !== 'donor') {
    return {
      ok: false,
      error: 'You must be signed in as a donor to manage push notifications.',
    };
  }

  await connectToDatabase();

  const dbUser = await User.findById(session.user.id).select('isActive').lean();
  if (!dbUser?.isActive) {
    return {
      ok: false,
      error: 'Please complete and activate your donor profile first.',
    };
  }

  return { ok: true, donorId: session.user.id };
}

/**
 * Persists (or reassigns on same browser endpoint) a donor's Web Push subscription.
 */
export async function savePushSubscription(
  subscription: SerializedPushSubscription,
  userAgent?: string,
): Promise<PushActionResult> {
  const authResult = await getActiveDonorSession();
  if (!authResult.ok) {
    return { success: false, error: authResult.error };
  }

  const parsedSubscription = pushSubscriptionSchema.safeParse(subscription);
  if (!parsedSubscription.success) {
    return {
      success: false,
      error:
        parsedSubscription.error.issues[0]?.message ||
        'Invalid push subscription payload.',
    };
  }

  const parsedUserAgent = userAgentSchema.safeParse(userAgent ?? '');
  const safeUserAgent = parsedUserAgent.success ? parsedUserAgent.data : '';

  try {
    const { endpoint, expirationTime, keys } = parsedSubscription.data;

    await PushSubscription.findOneAndUpdate(
      { endpoint },
      {
        donorId: authResult.donorId,
        endpoint,
        expirationTime: expirationTime ?? null,
        keys: {
          p256dh: keys.p256dh,
          auth: keys.auth,
        },
        userAgent: safeUserAgent,
      },
      {
        upsert: true,
        returnDocument: 'after',
        setDefaultsOnInsert: true,
      },
    );

    revalidatePath('/donor/dashboard');

    return { success: true };
  } catch (error) {
    console.error(
      '[Action: savePushSubscription]',
      error instanceof Error ? error.message : 'Unknown error',
    );
    return {
      success: false,
      error: 'Failed to save your push notification subscription.',
    };
  }
}

/**
 * Removes a donor's Web Push subscription for the specified browser endpoint.
 */
export async function removePushSubscription(
  endpoint: string,
): Promise<PushActionResult> {
  const authResult = await getActiveDonorSession();
  if (!authResult.ok) {
    return { success: false, error: authResult.error };
  }

  const parsedEndpoint = endpointSchema.safeParse(endpoint);
  if (!parsedEndpoint.success) {
    return {
      success: false,
      error:
        parsedEndpoint.error.issues[0]?.message ||
        'Invalid push subscription endpoint.',
    };
  }

  try {
    await PushSubscription.deleteOne({
      donorId: authResult.donorId,
      endpoint: parsedEndpoint.data,
    });

    revalidatePath('/donor/dashboard');

    return { success: true };
  } catch (error) {
    console.error(
      '[Action: removePushSubscription]',
      error instanceof Error ? error.message : 'Unknown error',
    );
    return {
      success: false,
      error: 'Failed to remove your push notification subscription.',
    };
  }
}

/**
 * Checks whether the active donor currently has a stored push subscription
 * (optionally scoped to a specific browser endpoint).
 */
export async function getDonorPushSubscriptionStatus(
  endpoint?: string,
): Promise<PushSubscriptionStatusResult> {
  const authResult = await getActiveDonorSession();
  if (!authResult.ok) {
    return { success: false, subscribed: false, error: authResult.error };
  }

  try {
    if (endpoint) {
      const parsedEndpoint = endpointSchema.safeParse(endpoint);
      if (!parsedEndpoint.success) {
        return {
          success: false,
          subscribed: false,
          error: 'Invalid push subscription endpoint.',
        };
      }

      const exists = await PushSubscription.exists({
        donorId: authResult.donorId,
        endpoint: parsedEndpoint.data,
      });

      return { success: true, subscribed: Boolean(exists) };
    }

    const exists = await PushSubscription.exists({
      donorId: authResult.donorId,
    });

    return { success: true, subscribed: Boolean(exists) };
  } catch (error) {
    console.error(
      '[Action: getDonorPushSubscriptionStatus]',
      error instanceof Error ? error.message : 'Unknown error',
    );
    return {
      success: false,
      subscribed: false,
      error: 'Unable to check push notification status.',
    };
  }
}
