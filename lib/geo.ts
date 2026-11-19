import { z } from 'zod';
import { ILocationCoordinates } from '@/types/location.type';

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

const EARTH_RADIUS_METERS = 6371e3;

function toRadians(degrees: number): number {
  return (degrees * Math.PI) / 180;
}

export function calculateHaversineDistance(
  coord1: ILocationCoordinates,
  coord2: ILocationCoordinates,
): number {
  const phi1 = toRadians(coord1.latitude);
  const phi2 = toRadians(coord2.latitude);
  const deltaPhi = toRadians(coord2.latitude - coord1.latitude);
  const deltaLambda = toRadians(coord2.longitude - coord1.longitude);

  const a =
    Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
    Math.cos(phi1) *
      Math.cos(phi2) *
      Math.sin(deltaLambda / 2) *
      Math.sin(deltaLambda / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return EARTH_RADIUS_METERS * c;
}

export function shouldSyncLocation(
  currentCoords: ILocationCoordinates,
  lastSyncedCoords: ILocationCoordinates | null,
  lastSyncedTime: Date | null,
  distanceThresholdMeters = 200,
  timeThresholdMs = 15 * 60 * 1000,
): boolean {
  if (!lastSyncedCoords || !lastSyncedTime) {
    return true;
  }

  const distance = calculateHaversineDistance(currentCoords, lastSyncedCoords);
  if (distance >= distanceThresholdMeters) {
    return true;
  }

  const elapsed = Date.now() - lastSyncedTime.getTime();
  if (elapsed >= timeThresholdMs) {
    return true;
  }

  return false;
}
