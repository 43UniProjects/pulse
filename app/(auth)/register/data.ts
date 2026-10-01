export type AccountRole = 'donor' | 'hospital';

export interface DonorProfile {
  id: string;
  role: 'donor';
  fullName: string;
  dob: string;
  email: string;
  bloodGroup: string;
  phone: string;
  location: string;
}

export interface HospitalProfile {
  id: string;
  role: 'hospital';
  hospitalName: string;
  registrationNumber: string;
  contactPerson: string;
  email: string;
  dispatchPhone: string;
  location: string;
}

// In-memory mock database stores
const MOCK_DONORS: DonorProfile[] = [];
const MOCK_HOSPITALS: HospitalProfile[] = [];

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function createAccount(
  role: AccountRole,
  data: any,
): Promise<void> {
  // Simulate network/database latency
  await new Promise((resolve) => setTimeout(resolve, 800));

  // Simulate an email uniqueness check
  const isEmailTaken =
    MOCK_DONORS.some((d) => d.email === data.email) ||
    MOCK_HOSPITALS.some((h) => h.email === data.email);

  if (isEmailTaken) {
    throw new Error('An account with this email already exists.');
  }

  // Save to the respective mock collection
  const newId = `usr_${Math.random().toString(36).substring(2, 9)}`;

  if (role === 'donor') {
    MOCK_DONORS.push({ id: newId, role: 'donor', ...data });
  } else {
    MOCK_HOSPITALS.push({ id: newId, role: 'hospital', ...data });
  }

  console.log(`[Mock DB] Created new ${role}:`, data.email);
}
