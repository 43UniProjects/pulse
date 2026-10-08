import { connectToDatabase } from '@/lib/db/connect';
import { User } from '@/lib/models/user.model';
import { RegistrationPayload } from './types';

export async function createAccount(
  payload: RegistrationPayload,
): Promise<void> {
  await connectToDatabase();

  const existingUser = await User.findOne({
    email: payload.email.toLowerCase(),
  }).lean();

  if (existingUser) {
    throw new Error('An account with this email already exists.');
  }

  await User.create({
    email: payload.email.toLowerCase(),
    password: payload.password,
    role: payload.role,
    name: payload.name || payload.email.split('@')[0],
  });
}
