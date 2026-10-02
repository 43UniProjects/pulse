import { BloodGroup } from './common.type';

export type DonationStatus =
  'scheduled' | 'completed' | 'verified' | 'rejected';

export interface ScreeningResults {
  hiv: 'negative' | 'positive' | 'pending';
  hepatitisB: 'negative' | 'positive' | 'pending';
  hepatitisC: 'negative' | 'positive' | 'pending';
  syphilis: 'negative' | 'positive' | 'pending';
  hemoglobinLevel?: string; // e.g., "14.2 g/dL"
}

export interface DonationEntity {
  _id?: string;
  donationId: string; // Human-readable reference (e.g., DON-5092)
  requestId?: string | null; // Linked Emergency Request ID (if applicable)
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
