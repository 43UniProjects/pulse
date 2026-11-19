import { BLOOD_GROUPS, type BloodGroup } from '../../types/common.type';

/**
 * 8-way recipient-to-compatible-donor blood compatibility matrix.
 * Key = requested recipient blood group; value = compatible donor blood groups.
 */
export const BLOOD_COMPATIBILITY: Record<BloodGroup, BloodGroup[]> = {
  'O-': ['O-'],
  'O+': ['O+', 'O-'],
  'A-': ['A-', 'O-'],
  'A+': ['A+', 'A-', 'O+', 'O-'],
  'B-': ['B-', 'O-'],
  'B+': ['B+', 'B-', 'O+', 'O-'],
  'AB-': ['AB-', 'A-', 'B-', 'O-'],
  'AB+': ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
};

/**
 * Mandatory clinical waiting period between whole-blood donations (days).
 */
export const COOLDOWN_DAYS = 120;
export const COOLDOWN_MS = COOLDOWN_DAYS * 24 * 60 * 60 * 1000;

const EARTH_RADIUS_KM = 6371;

/**
 * Inverse blood compatibility lookup for donor-facing views.
 * Returns every request blood group that a donor with `donorBloodGroup` can safely donate to.
 */
export function getCompatibleRequestBloodGroups(
  donorBloodGroup: BloodGroup | '',
): BloodGroup[] {
  if (!donorBloodGroup) {
    return [];
  }

  return BLOOD_GROUPS.filter((requestBloodGroup) =>
    BLOOD_COMPATIBILITY[requestBloodGroup].includes(donorBloodGroup),
  );
}

/**
 * Returns the cutoff timestamp for the 120-day medical cooldown rule.
 * Donors whose `lastDonationDate` is null or <= this cutoff are past cooldown.
 */
export function getCooldownCutoffDate(now: Date = new Date()): Date {
  return new Date(now.getTime() - COOLDOWN_MS);
}

/**
 * Evaluates whether a donor's last donation date satisfies the 120-day waiting period.
 */
export function isDonorPastCooldown(
  lastDonationDate?: Date | string | null,
  now: Date = new Date(),
): boolean {
  if (!lastDonationDate) {
    return true;
  }

  const parsed =
    lastDonationDate instanceof Date
      ? lastDonationDate
      : new Date(lastDonationDate);

  if (Number.isNaN(parsed.getTime())) {
    return false;
  }

  return parsed.getTime() <= getCooldownCutoffDate(now).getTime();
}

function toRadians(degrees: number): number {
  return (degrees * Math.PI) / 180;
}

/**
 * Computes spherical great-circle distance in kilometers between two GeoJSON coordinates
 * strictly ordered as `[longitude, latitude]`, rounded to 1 decimal place.
 */
export function calculateDistanceKm(
  from: [number, number],
  to: [number, number],
): number {
  const [fromLng, fromLat] = from;
  const [toLng, toLat] = to;

  const deltaLat = toRadians(toLat - fromLat);
  const deltaLng = toRadians(toLng - fromLng);
  const lat1 = toRadians(fromLat);
  const lat2 = toRadians(toLat);

  const a =
    Math.sin(deltaLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(deltaLng / 2) ** 2;

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distanceKm = EARTH_RADIUS_KM * c;

  return Math.round(distanceKm * 10) / 10;
}

export interface EligibleDonorMatchQueryParams {
  bloodGroup: BloodGroup;
  hospitalCoordinates: [number, number];
  radiusKm: number;
  now?: Date;
}

/**
 * Builds the MongoDB `$nearSphere` filter matching clinically eligible, available,
 * blood-compatible donors within `radiusKm` of the hospital's GeoJSON coordinates.
 */
export function buildEligibleDonorNearSphereQuery({
  bloodGroup,
  hospitalCoordinates,
  radiusKm,
  now = new Date(),
}: EligibleDonorMatchQueryParams) {
  return {
    bloodGroup: { $in: BLOOD_COMPATIBILITY[bloodGroup] },
    isAvailable: true,
    isEligible: true,
    $or: [
      { lastDonationDate: null },
      { lastDonationDate: { $lte: getCooldownCutoffDate(now) } },
    ],
    location: {
      $nearSphere: {
        $geometry: {
          type: 'Point' as const,
          coordinates: hospitalCoordinates,
        },
        $maxDistance: radiusKm * 1000,
      },
    },
  };
}

export interface NearbyRequestsMatchQueryParams {
  donorBloodGroup: BloodGroup;
  donorCoordinates: [number, number];
  radiusKm: number;
}

/**
 * Builds the MongoDB `$nearSphere` filter matching active pending requests
 * compatible with a donor's blood group within `radiusKm` of the donor's coordinates.
 */
export function buildNearbyRequestsNearSphereQuery({
  donorBloodGroup,
  donorCoordinates,
  radiusKm,
}: NearbyRequestsMatchQueryParams) {
  return {
    status: 'pending' as const,
    bloodGroup: { $in: getCompatibleRequestBloodGroups(donorBloodGroup) },
    location: {
      $nearSphere: {
        $geometry: {
          type: 'Point' as const,
          coordinates: donorCoordinates,
        },
        $maxDistance: radiusKm * 1000,
      },
    },
  };
}

const ensuredGeoIndexes = new Map<string, Promise<void>>();

/**
 * Runs a model's index creation at most once per process key so `$nearSphere`
 * queries on fresh databases (e.g., new Docker volumes) always have a 2dsphere index.
 * Failed attempts are evicted from the cache so subsequent calls can retry.
 */
export async function ensureGeoIndexOnce(
  key: string,
  createIndexes: () => Promise<unknown>,
): Promise<void> {
  let pending = ensuredGeoIndexes.get(key);

  if (!pending) {
    pending = Promise.resolve()
      .then(() => createIndexes())
      .then(() => undefined)
      .catch((error) => {
        ensuredGeoIndexes.delete(key);
        throw error;
      });

    ensuredGeoIndexes.set(key, pending);
  }

  return pending;
}

/**
 * Clears the cached index-initialization map (intended for unit tests).
 */
export function resetGeoIndexCacheForTests(): void {
  ensuredGeoIndexes.clear();
}
