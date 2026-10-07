import { UserRole } from '@/types/user.type';
import { connectToDatabase } from '@/lib/db/connect';
import { User } from '@/lib/models/user.model';

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

  if (!user) {
    return null;
  }

  // Basic string comparison (update to bcrypt.compare when hashing is implemented!)
  if (user.password !== passwordInput) {
    return null;
  }

  return {
    _id: user._id.toString(),
    email: user.email,
    role: user.role,
    name: user.name || '',
  };
}
