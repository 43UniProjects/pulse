'use server';

import { z } from 'zod';
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
  const validated = locationCoordSchema.safeParse(coords);

  if (!validated.success) {
    return {
      success: false,
      error: validated.error.issues[0]?.message || 'Invalid coordinates',
    };
  }

  return { success: true };
}
