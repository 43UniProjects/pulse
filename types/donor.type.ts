import { BloodGroup, IGeoPoint } from './common.type';

export interface DonorEntity {
  _id?: string; // MongoDB ObjectId string
  userId: string; // Reference to base Auth user
  fullName: string; // Donor's full legal name
  email: string; // Unique contact email
  phone: string; // Mobile number for SMS dispatch alerts
  bloodGroup: BloodGroup; // Compatible blood group
  dateOfBirth: string; // Used for age verification
  address: string; // Text-based residential address
  location: IGeoPoint; // Unified GeoJSON Point for $near geospatial radius filtering
  radiusPreferenceKm: number; // Maximum travel distance preference (e.g., 10 km)
  lastDonationDate: string | null; // Used by the 4-month (120 days) eligibility engine
  isEligible: boolean; // Computed clinical eligibility status
  isAvailable: boolean; // Manual override (Do Not Disturb / Travel toggle)
  liveLocationSync: boolean; // Flag for constant background location tracking away from home
  smsAlertsEnabled: boolean; // Notification preference toggle
  emailAlertsEnabled: boolean; // Notification preference toggle
  history: string[]; // Array of Request IDs the donor has interacted with or fulfilled
  createdAt: string; // Account registration timestamp
  updatedAt: string; // Last profile update timestamp
}
