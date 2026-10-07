import {
  DonationRequestEntity,
  REQUEST_URGENCY_LEVEL,
  REQUEST_STATUS,
} from '@/types/donor-request.type';
import { DonorEntity } from '@/types/donor.type';
import { DonationEntity, DONATION_STATUS } from '@/types/donation.type';
import { BLOOD_GROUPS } from '@/types/common.type';

// ---------------------------------------------------------
// MOCK DATABASES
// ---------------------------------------------------------

// 1. Mocking Donation Requests (What hospitals post)
const REQUESTS_DB: Record<string, DonationRequestEntity> = {
  'REQ-8023': {
    _id: 'REQ-8023',
    hospitalId: 'hosp_1',
    hospitalName: 'Nawaloka Hospital',
    address: 'Deshamanya H. K. Dharmadasa Mawatha, Colombo 02',
    location: { type: 'Point', coordinates: [79.8511, 6.9157] },
    bloodGroup: BLOOD_GROUPS[6], // 'O+'
    quantity: 2,
    urgency: REQUEST_URGENCY_LEVEL[0], // 'critical'
    status: REQUEST_STATUS[0], // 'pending'
    radiusKm: 10,
    distance: '2.4 km',
    timePosted: '10 mins ago',
    notes:
      'Needed for emergency surgery scheduled at 6:00 AM. Please arrive ASAP.',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  'REQ-8040': {
    _id: 'REQ-8040',
    hospitalId: 'hosp_2',
    hospitalName: 'National Hospital of Sri Lanka',
    address: 'Regent Street, Colombo 10',
    location: { type: 'Point', coordinates: [79.8643, 6.9197] },
    bloodGroup: BLOOD_GROUPS[6], // 'O+'
    quantity: 1,
    urgency: REQUEST_URGENCY_LEVEL[1], // 'high'
    status: REQUEST_STATUS[0], // 'pending'
    radiusKm: 15,
    distance: '3.1 km',
    timePosted: '1 hour ago',
    notes: 'Urgent requirement for accident & emergency trauma unit.',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
};

// 2. Mocking Completed Donations (For Donor History)
const DONATIONS_DB: Record<string, DonationEntity> = {
  'DON-1001': {
    _id: 'DON-1001',
    donationId: 'DON-1001',
    requestId: 'REQ-8015',
    donorId: 'donor_1',
    hospitalId: 'hosp_3',
    bloodGroup: BLOOD_GROUPS[6], // 'O+'
    units: 1,
    status: DONATION_STATUS[2], // 'completed'
    donationDate: new Date('2026-03-12T10:00:00Z').toISOString(),
    clinicalNotes: 'Smooth donation process.',
    createdAt: new Date('2026-03-12T10:00:00Z').toISOString(),
    updatedAt: new Date('2026-03-12T10:00:00Z').toISOString(),
  },
  'DON-1002': {
    _id: 'DON-1002',
    donationId: 'DON-1002',
    requestId: 'REQ-7992',
    donorId: 'donor_1',
    hospitalId: 'hosp_4',
    bloodGroup: BLOOD_GROUPS[6], // 'O+'
    units: 1,
    status: DONATION_STATUS[2], // 'completed'
    donationDate: new Date('2025-11-10T14:30:00Z').toISOString(),
    createdAt: new Date('2025-11-10T14:30:00Z').toISOString(),
    updatedAt: new Date('2025-11-10T14:30:00Z').toISOString(),
  },
};

// 3. Mocking the Donor Profiles
const DONORS_DB: Record<string, DonorEntity> = {
  donor_1: {
    _id: 'donor_1',
    fullName: 'Kamal Perera',
    email: 'kamal@example.com',
    phone: '+94 77 123 4567',
    bloodGroup: BLOOD_GROUPS[6], // 'O+'
    dateOfBirth: new Date('1990-05-15'),
    address: 'Nugegoda, Colombo',
    location: { type: 'Point', coordinates: [79.8963, 6.8649] },
    radiusPreferenceKm: 15,
    lastDonationDate: new Date('2026-03-12T10:00:00Z'),
    isEligible: true,
    isAvailable: true,
    liveLocationSync: false,
    smsAlertsEnabled: true,
    emailAlertsEnabled: false,
    // Filling the history with actual DonationEntity objects
    history: [DONATIONS_DB['DON-1001'], DONATIONS_DB['DON-1002']],
  },
};

// ---------------------------------------------------------
// DATA FETCHING FUNCTIONS
// ---------------------------------------------------------

/**
 * Retrieves a donor's profile.
 */
export function getDonorProfile(donorId: string): DonorEntity | null {
  return DONORS_DB[donorId] || null;
}

/**
 * Retrieves a donor's specific donation history.
 */
export function getDonationHistory(donorId: string): DonationEntity[] {
  const donor = getDonorProfile(donorId);

  if (!donor || !donor.history) return [];

  // Since we directly populated history with DonationEntity objects in the mock, return it
  return donor.history as DonationEntity[];
}

/**
 * Retrieves all active, pending requests in the network.
 */
export function getDonationRequests(): Record<string, DonationRequestEntity> {
  const activeRequests: Record<string, DonationRequestEntity> = {};

  Object.values(REQUESTS_DB).forEach((req) => {
    if (req.status === 'pending') {
      // In a real app, you would use the `_id` of the document
      activeRequests[req._id as string] = req;
    }
  });

  return activeRequests;
}

/**
 * Retrieves a single specific blood request by its ID.
 */
export function getDonationRequest(
  requestId: string,
): DonationRequestEntity | null {
  return REQUESTS_DB[requestId] || null;
}
