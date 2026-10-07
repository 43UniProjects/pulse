import { BloodGroup } from './common.type';

export const DONATION_STATUS = [
  'pending',
  'accepted',
  'completed',
  'declined',
  'expired',
] as const;

export type DonationStatus = (typeof DONATION_STATUS)[number];

export const SCREENING_STATUS = ['negative', 'positive', 'pending'] as const;

export type ScreeningStatus = (typeof SCREENING_STATUS)[number];

export interface ScreeningResults {
  hiv: ScreeningStatus;
  hepatitisB: ScreeningStatus;
  hepatitisC: ScreeningStatus;
  syphilis: ScreeningStatus;
  hemoglobinLevel?: string; // e.g., "14.2 g/dL"
}

export interface DonationEntity {
  _id?: string;
  donationId: string;
  requestId?: string | null;
  donorId: string; // Reference to the Donor user
  hospitalId: string; // Reference to the Hospital facility
  bloodGroup: BloodGroup;
  units: number; // Number of units donated (integer)
  status: DonationStatus;
  donationDate: string; // ISO Timestamp of the actual donation
  expiryDate?: string; // Calculated shelf-life (35-42 days for red cells)
  batchNumber?: string; // Hospital blood bank internal inventory code
  clinicalNotes?: string;
  screeningResults?: ScreeningResults;
  createdAt: string;
  updatedAt: string;
}
