'use server';

import { z } from 'zod';
import { headers } from 'next/headers';
import { auth } from '@/lib/auth/config';
import { connectToDatabase } from '@/lib/db/connect';
import { Donor } from '@/lib/models/donor.model';
import {
  ILocationActionResponse,
  ILocationCoordinates,
} from '@/types/location.type';

/**
 * Zod validation schema for geographic coordinates.
 * Strictly verifies longitude (-180 to 180) and latitude (-90 to 90).
 */
export const locationCoordSchema = z.object({
  longitude: z
    .number()
    .min(-180, 'Longitude must be between -180 and 180')
    .max(180, 'Longitude must be between -180 and 180'),
  latitude: z
    .number()
    .min(-90, 'Latitude must be between -90 and 90')
    .max(90, 'Latitude must be between -90 and 90'),
});

/**
 * Server action to synchronize donor live coordinates.
 */
export async function syncDonorLocation(
  coords: ILocationCoordinates,
): Promise<ILocationActionResponse> {
  // 1. Validate coordinates boundaries
  const validated = locationCoordSchema.safeParse(coords);

  if (!validated.success) {
    return {
      success: false,
      error: validated.error.issues[0]?.message || 'Invalid coordinates',
    };
  }

  // 2. Verify authenticated donor session
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user || session.user.role !== 'donor') {
    return {
      success: false,
      error: 'Unauthorized: Donor access required',
    };
  }

  // 3. Persist GeoJSON coordinates into MongoDB
  try {
    await connectToDatabase();
    const { longitude, latitude } = validated.data;

    await Donor.findByIdAndUpdate(session.user.id, {
      location: {
        type: 'Point',
        coordinates: [longitude, latitude],
      },
      lastLocationUpdatedAt: new Date(),
    });

    return {
      success: true,
      syncedAt: new Date().toISOString(),
    };
  } catch (error: unknown) {
    console.error('[Action: syncDonorLocation]', error);
    return {
      success: false,
      error: 'Failed to update location coordinates. Please try again.',
    };
  }
}
