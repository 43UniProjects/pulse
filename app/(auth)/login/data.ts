import { UserRole } from '@/types/user.type';

export interface UserProfile {
  _id: string;
  email: string;
  role: UserRole;
  name: string;
}

// In-memory mock database store
const MOCK_USERS: UserProfile[] = [
  {
    _id: 'usr_1',
    email: 'donor@example.lk',
    role: 'donor',
    name: 'Kamal Perera',
  },
  {
    _id: 'usr_2',
    email: 'hospital@nawaloka.lk',
    role: 'hospital',
    name: 'Nawaloka Hospital',
  },
  { _id: 'usr_3', email: 'admin@pulse.lk', role: 'admin', name: 'Super Admin' },
];

export async function findUserByCredentials(
  email: string,
  role: UserRole,
): Promise<UserProfile | null> {
  const user = MOCK_USERS.find(
    (u) => u.email.toLowerCase() === email.toLowerCase() && u.role === role,
  );

  return user || null;
}
