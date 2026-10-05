import { IGeoPoint } from './common.type';
import { UserEntity } from './user.type';
import { AdminEntity } from './admin.type';

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
] as const;

export type FacilityType = (typeof HOSPITAL_TYPE)[number];
export type VerificationStatus = (typeof VERIFICATION_STATUS)[number];

export interface HospitalCoordinator {
  name: string;
  designation: string;
  contactNumber: string;
  email: string;
}

export interface HospitalEntity {
  _id: string | UserEntity;
  name: string;
  facilityType: FacilityType;
  verificationStatus: VerificationStatus;
  verifiedAt?: Date | null;
  verifiedBy?: string | AdminEntity | null;
  address: string;
  city: string;
  location: IGeoPoint;
  hotline: string;
  email: string;
  website?: string;
  coordinator: HospitalCoordinator;
  activeRequestsCount?: number;
  createdAt?: Date;
  updatedAt?: Date;
}
