import { User } from '@/lib/models/user.model';

/**
 * Ensures inactive users or profiles without recorded GPS timestamps
 * have completed live location capture before saving profile updates.
 */
export async function verifyProfileLocationCapture({
  userId,
  locationCaptured,
  existingLastLocationUpdatedAt,
}: {
  userId: string;
  locationCaptured: boolean;
  existingLastLocationUpdatedAt?: Date | null;
}): Promise<{
  allowed: boolean;
  error?: string;
  fieldErrors?: Record<string, string[]>;
  nextLocationUpdatedAt?: Date;
}> {
  if (locationCaptured) {
    return {
      allowed: true,
      nextLocationUpdatedAt: new Date(),
    };
  }

  const dbUser = await User.findById(userId).select('isActive').lean();
  const isAlreadyActiveWithLocation =
    Boolean(dbUser?.isActive) && Boolean(existingLastLocationUpdatedAt);

  if (isAlreadyActiveWithLocation && existingLastLocationUpdatedAt) {
    return {
      allowed: true,
      nextLocationUpdatedAt: existingLastLocationUpdatedAt,
    };
  }

  return {
    allowed: false,
    error:
      'Please click "Update Live Location" to capture your GPS coordinates before saving.',
    fieldErrors: {
      location: [
        'Please click "Update Live Location" and allow GPS access before saving.',
      ],
    },
  };
}
