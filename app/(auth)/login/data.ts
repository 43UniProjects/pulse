import bcrypt from 'bcryptjs';
import { connectToDatabase } from '@/lib/db/connect';
import { User } from '@/lib/models/user.model';
import { UserRole } from '@/types/user.type';

export interface UserProfile {
  _id: string;
  email: string;
  role: UserRole;
  name: string;
}

export async function findUserByCredentials(
  email: string,
  passwordInput: string,
  role: UserRole,
): Promise<UserProfile | null> {
  await connectToDatabase();

  const user = await User.findOne({
    email: email.toLowerCase(),
    role: role,
  }).lean();

  if (!user || !user.password) {
    return null;
  }

  const isPasswordValid = await bcrypt.compare(
    passwordInput,
    user.password as string,
  );

  if (!isPasswordValid) {
    return null;
  }

  return {
    _id: String(user._id),
    email: user.email,
    role: user.role as UserRole,
    name: user.name || '',
  };
}
