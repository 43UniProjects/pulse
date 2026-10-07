import { BloodGroup, IGeoPoint } from './common.type';

export const REQUEST_URGENCY_LEVEL = ['critical', 'high', 'normal'] as const;
export const REQUEST_STATUS = [
  'pending',
  'accepted',
  'completed',
  'declined',
] as const;

export type RequestUrgency = (typeof REQUEST_URGENCY_LEVEL)[number];
export type RequestStatus = (typeof REQUEST_STATUS)[number];

export type Units = number;

export interface DonationRequestEntity {
  _id?: string; // MongoDB ObjectId string
  hospitalId: string; // Reference to the posting Hospital entity/user
  hospitalName: string; // Name of the medical institution
  address: string; // Physical street address of the hospital
  location: IGeoPoint; // Unified GeoJSON Point for radius matching against donors
  bloodGroup: BloodGroup; // Required blood type compatibility
  quantity: Units; // Quantity needed (e.g., 2)
  urgency: RequestUrgency; // Urgency level (critical, high, normal)
  status: RequestStatus; // Lifecycle status (pending, accepted, completed, declined)
  radiusKm: number; // Broadcast radius set by hospital (e.g., 10 km)
  distance?: string; // Computed client-side distance (e.g., "2.4 km")
  timePosted: string; // Relative or absolute timestamp (e.g., "10 mins ago")
  notes: string; // Clinical instructions and emergency details
  matchedDonorsCount?: number; // Count of notified donors within the target radius
  fulfilledBy?: string; // Reference to the donor who accepted/completed the request
  createdAt: string; // ISO timestamp of request creation
  updatedAt: string; // ISO timestamp of last update
}
