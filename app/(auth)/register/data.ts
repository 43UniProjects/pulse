export type AccountRole = 'donor' | 'hospital';

export interface BaseUser {
  id: string;
  role: AccountRole;
  email: string;
}

// In-memory mock database stores
const MOCK_USERS: BaseUser[] = [];

export async function createAccount(
  role: AccountRole,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any,
): Promise<void> {
  // Simulate network/database latency
  await new Promise((resolve) => setTimeout(resolve, 800));

  // Simulate an email uniqueness check
  const isEmailTaken = MOCK_USERS.some((u) => u.email === data.email);

  if (isEmailTaken) {
    throw new Error('An account with this email already exists.');
  }

  // Save to the mock collection with a hashed password (mocked with base64 for now)
  const newId = `usr_${Math.random().toString(36).substring(2, 9)}`;
  const hashedPassword = btoa(data.password || ''); // Mock hashing

  MOCK_USERS.push({
    id: newId,
    role,
    email: data.email,
    password: hashedPassword,
  } as BaseUser);

  console.log(`[Mock DB] Created new ${role}:`, data.email);
}
