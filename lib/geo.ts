import { ILocationCoordinates } from '@/types/location.type';

/**
 * Earth radius in meters (mean radius).
 */
const EARTH_RADIUS_METERS = 6371e3;

/**
 * Converts degrees to radians.
 */
function toRadians(degrees: number): number {
  return (degrees * Math.PI) / 180;
}

/**
 * Calculates great-circle distance between two geographic coordinates
 * using the Haversine formula (returns distance in meters).
 */
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

/**
 * Checks if distance or time threshold has been exceeded for location synchronization.
 * Default battery-saving thresholds:
 * - 200 meters distance moved OR
 * - 15 minutes (900,000 ms) time elapsed
 */
export function shouldSyncLocation(
  currentCoords: ILocationCoordinates,
  lastSyncedCoords: ILocationCoordinates | null,
  lastSyncedTime: Date | null,
  distanceThresholdMeters = 200,
  timeThresholdMs = 15 * 60 * 1000,
): boolean {
  // If never synced before, sync immediately
  if (!lastSyncedCoords || !lastSyncedTime) {
    return true;
  }

  // Check distance threshold (moved >= 200m)
  const distance = calculateHaversineDistance(currentCoords, lastSyncedCoords);
  if (distance >= distanceThresholdMeters) {
    return true;
  }

  // Check time threshold (elapsed >= 15 minutes)
  const elapsed = Date.now() - lastSyncedTime.getTime();
  if (elapsed >= timeThresholdMs) {
    return true;
  }

  return false;
}
