import { BloodGroup, IGeoPoint } from './common.type';
import { DonationEntity } from './donation.type';
import { UserEntity } from './user.type';

export interface DonorEntity {
  _id: string | UserEntity;
  fullName: string;
  email: string;
  phone: string;
  bloodGroup: BloodGroup;
  dateOfBirth: Date;
  address: string;
  location: IGeoPoint;
  radiusPreferenceKm: number;
  lastDonationDate: Date | null;
  isEligible: boolean;
  isAvailable: boolean;
  liveLocationSync: boolean;
  smsAlertsEnabled: boolean;
  emailAlertsEnabled: boolean;
  history: string[] | DonationEntity[];
  createdAt?: Date;
  updatedAt?: Date;
}
