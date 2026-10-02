import { IGeoPoint } from './common.type';

export const HOSPITAL_TYPE = [
  'government_hospital',
  'private_hospital',
  'blood_bank',
  'clinic',
] as const;
export const VERIFICATION_STATUS = [
  'pending',
  'verified',
  'rejected',
  'suspended',
];

export type FacilityType = (typeof HOSPITAL_TYPE)[number];
export type VerificationStatus = (typeof VERIFICATION_STATUS)[number];

export interface HospitalCoordinator {
  name: string;
  designation: string;
  contactNumber: string;
  email: string;
}

export interface HospitalEntity {
  _id?: string;
  userId: string; // Reference to base Auth user
  name: string; // e.g., "Nawaloka Hospital"
  licenseNumber: string; // Healthcare regulatory / registration ID
  facilityType: FacilityType;
  verificationStatus: VerificationStatus;
  verifiedAt?: string | null;
  verifiedBy?: string | null; // Admin ID who approved facility
  address: string; // Human-readable street address
  city: string;
  location: IGeoPoint; // Unified GeoJSON Point
  hotline: string; // Primary emergency desk phone
  email: string;
  website?: string;
  coordinator: HospitalCoordinator; // Assigned point of contact for blood bank coordination
  activeRequestsCount?: number; // Running counter for active emergencies
  createdAt: string;
  updatedAt: string;
}
