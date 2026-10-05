// ---------------------------------------------------------
// Types
// ---------------------------------------------------------

export interface DonorProfile {
  id: string;
  fullName: string;
  bloodGroup: string;
  phone: string;
  location: string;
  lastDonationDate: string;
  isVerified: boolean;
  verifiedBy: string;
  verificationDate: string;
  isAvailable: boolean;
}

export type RequestUrgency = 'critical' | 'high' | 'normal';
export type RequestStatus = 'pending' | 'accepted' | 'completed' | 'declined';

export interface RequestDetails {
  id: string;
  hospitalName: string;
  address: string;
  bloodGroup: string;
  quantity: string;
  urgency: RequestUrgency;
  status: RequestStatus;
  distance: string;
  timePosted: string;
  notes: string;
}

export interface Donor {
  id: string;
  fullName: string;
  bloodGroup: string;
  location: string;
  history: string[]; // Array of Request IDs the donor has interacted with
}

// ---------------------------------------------------------
// MOCK DATABASES
// ---------------------------------------------------------

const REQUESTS_DB: Record<string, RequestDetails> = {
  // Pending Requests (Active in the network)
  'REQ-8023': {
    id: 'REQ-8023',
    hospitalName: 'Nawaloka Hospital',
    address: 'Deshamanya H. K. Dharmadasa Mawatha, Colombo 02',
    bloodGroup: 'O+',
    quantity: '2 units',
    urgency: 'critical',
    status: 'pending',
    distance: '2.4 km',
    timePosted: '10 mins ago',
    notes:
      'Needed for emergency surgery scheduled at 6:00 AM. Please arrive ASAP.',
  },
  'REQ-8040': {
    id: 'REQ-8040',
    hospitalName: 'National Hospital of Sri Lanka',
    address: 'Regent Street, Colombo 10',
    bloodGroup: 'O+',
    quantity: '1 unit',
    urgency: 'high',
    status: 'pending',
    distance: '3.1 km',
    timePosted: '1 hour ago',
    notes: 'Urgent requirement for accident & emergency trauma unit.',
  },
  // Historical Requests (Already accepted/completed by donors)
  'REQ-8015': {
    id: 'REQ-8015',
    hospitalName: 'Asiri Central Hospital',
    address: 'Norris Canal Road, Colombo 10',
    bloodGroup: 'B+',
    quantity: '1 unit',
    urgency: 'high',
    status: 'accepted',
    distance: '4.1 km',
    timePosted: '2 days ago',
    notes: 'For a patient in the ICU. Preferred within 4 hours.',
  },
  'REQ-7992': {
    id: 'REQ-7992',
    hospitalName: 'Lanka Hospitals',
    address: 'Narahenpita Road, Colombo 05',
    bloodGroup: 'A-',
    quantity: '3 units',
    urgency: 'normal',
    status: 'completed',
    distance: '5.8 km',
    timePosted: '4 months ago',
    notes: 'Elective surgery tomorrow morning. Advance planning.',
  },
};

const DONORS_DB: Record<string, Donor> = {
  '1': {
    id: '1',
    fullName: 'Kamal Perera',
    bloodGroup: 'O+',
    location: 'Colombo 05',
    // Kamal's history links directly to the historical requests in REQUESTS_DB
    history: ['REQ-8015', 'REQ-7992'],
  },
};

const DONOR_PROFILES: Record<string, DonorProfile> = {
  '1': {
    id: '1',
    fullName: 'Kamal Perera',
    bloodGroup: 'O+',
    phone: '+94 77 123 4567',
    location: 'Nugegoda, Colombo',
    lastDonationDate: '12 March 2026',
    isVerified: true,
    verifiedBy: 'Nawaloka Hospital',
    verificationDate: '18 Sep 2026',
    isAvailable: true,
  },
};

// ---------------------------------------------------------
// DATA FETCHING FUNCTIONS
// ---------------------------------------------------------

/**
 * Retrieves a donor's profile and metadata.
 */
export function getDonor(donorId: string): Donor | null {
  return DONORS_DB[donorId] || null;
}

/**
 * Retrieves a donor's specific history -> getDonor(donorId).history
 */
export function getDonationHistory(
  donorId: string,
): Record<string, RequestDetails> {
  const donor = getDonor(donorId);

  if (!donor) return {};

  const historyRecord: Record<string, RequestDetails> = {};

  // Map the IDs from the donor's history array to the actual request objects
  donor.history.forEach((reqId) => {
    if (REQUESTS_DB[reqId]) {
      historyRecord[reqId] = REQUESTS_DB[reqId];
    }
  });

  return historyRecord;
}

/**
 * Retrieves all active, pending requests in the network for a donor.
 * In a real backend, this would filter by donor.bloodGroup compatibility and geo-radius.
 */
export function getDonationRequests(
  donorId: string,
): Record<string, RequestDetails> {
  const activeRequests: Record<string, RequestDetails> = {};

  // Filter all requests in the DB for those that are still 'pending'
  Object.values(REQUESTS_DB).forEach((req) => {
    if (req.status === 'pending') {
      activeRequests[req.id] = req;
    }
  });

  return activeRequests;
}

/**
 * Retrieves a single specific blood request by its ID.
 */
export function getDonationRequest(requestId: string): RequestDetails | null {
  return REQUESTS_DB[requestId] || null;
}

/**
 * Retrieves the donor's personal profile information.
 */
export function getDonorProfile(donorId: string): DonorProfile | null {
  return DONOR_PROFILES[donorId] || null;
}
