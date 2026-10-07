import { UserEntity } from '@/types/user.type';
import { RegistrationPayload } from './types';

// Mock user collection
const MOCK_USERS: UserEntity[] = [];

export async function createAccount(
  payload: RegistrationPayload,
): Promise<void> {
  const isEmailTaken = MOCK_USERS.some((u) => u.email === payload.email); // check if the email is already registered

  if (isEmailTaken) {
    throw new Error('An account with this email already exists.');
  }

  const newId = `64f1${Math.random().toString(16).substring(2, 14)}`; // generate new id for mock db, remove upon conn to real db

  const newUser: UserEntity = {
    _id: newId, // remove when connecting to real db
    email: payload.email,
    role: payload.role,
    isActive: false, // Account is deactivated until email is verified, default in real db
    emailVerified: null, // default in real db, null | Date
  };

  MOCK_USERS.push(newUser);

  console.log(
    `[Mock DB] Created new deactivated base User for ${payload.role}:`,
    payload.email,
  );
}
