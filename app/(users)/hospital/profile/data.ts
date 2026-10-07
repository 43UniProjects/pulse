import { HospitalEntity } from '@/types/hospital.type';

const HOSPITALS_DB: Record<string, HospitalEntity> = {
  hospital_1: {
    _id: 'hospital_1', // matches base User._id conceptually
    name: 'National Hospital of Sri Lanka',
    facilityType: 'government_hospital',
    verificationStatus: 'verified',
    verifiedAt: new Date('2023-01-15'),
    address: 'Regent Street, Colombo 08',
    city: 'Colombo',
    location: {
      type: 'Point',
      coordinates: [79.8661, 6.9197], // [longitude, latitude]
    },
    hotline: '+94 11 269 1111',
    email: 'bloodbank@nhsl.health.lk',
    website: 'https://nhsl.health.lk',
    coordinator: {
      name: 'Dr. Saman Weerasinghe',
      designation: 'Head of Blood Bank',
      contactNumber: '+94 71 234 5678',
      email: 'saman.w@nhsl.health.lk',
    },
    activeRequestsCount: 3,
    createdAt: new Date('2023-01-10'),
    updatedAt: new Date('2024-01-01'),
  },
};

/**
 * Retrieves a hospital's profile.
 */
export async function getHospitalProfile(
  hospitalId: string,
): Promise<HospitalEntity | null> {
  return HOSPITALS_DB[hospitalId] || null;
}
