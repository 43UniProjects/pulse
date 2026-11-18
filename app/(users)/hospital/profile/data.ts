import { connectToDatabase } from '@/lib/db/connect';
import { Hospital } from '@/lib/models/hospital.model';
import { HospitalEntity } from '@/types/hospital.type';

/**
 * Retrieves a hospital's profile from MongoDB.
 */
export async function getHospitalProfile(
  hospitalId: string,
): Promise<HospitalEntity | null> {
  await connectToDatabase();
  const hospital = await Hospital.findById(hospitalId).lean();
  if (!hospital) return null;

  return {
    ...hospital,
    _id: hospital._id.toString(),
    verifiedBy: hospital.verifiedBy ? hospital.verifiedBy.toString() : null,
    verifiedAt: hospital.verifiedAt ? new Date(hospital.verifiedAt) : null,
    createdAt: hospital.createdAt ? new Date(hospital.createdAt) : undefined,
    updatedAt: hospital.updatedAt ? new Date(hospital.updatedAt) : undefined,
  } as unknown as HospitalEntity;
}
