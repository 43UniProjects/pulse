import { BloodGroup, IGeoPoint } from '@/types/common.type';
import { DonationEntity } from '@/types/donation.type';
import { UserEntity } from '@/types/user.type';

export interface DonorEntity {
  _id: string | UserEntity;
  fullName: string;
  email: string;
  phone: string;
  bloodGroup: BloodGroup | '';
  dateOfBirth?: Date | null;
  address: string;
  location: IGeoPoint;
  radiusPreferenceKm: number;
  lastDonationDate: Date | null;
  isEligible: boolean;
  isAvailable: boolean;
  liveLocationSync: boolean;
  lastLocationUpdatedAt?: Date | null;
  smsAlertsEnabled: boolean;
  emailAlertsEnabled: boolean;
  history: string[] | DonationEntity[];
  createdAt?: Date;
  updatedAt?: Date;
}
