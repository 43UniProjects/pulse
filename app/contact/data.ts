import { connectToDatabase } from '@/lib/db/connect';
import { User } from '@/lib/models/user.model';
import { Contact } from '@/lib/models/contact.model';

export interface PreFillData {
  _id: string | null;
  name: string;
  email: string;
  role: string;
}

export async function getContactPreFillData(
  userId?: string,
): Promise<PreFillData> {
  if (!userId) {
    return { _id: null, name: '', email: '', role: 'guest' };
  }

  await connectToDatabase();
  const user = await User.findById(userId).lean();

  if (!user) {
    return { _id: null, name: '', email: '', role: 'guest' };
  }

  return {
    _id: String(user._id),
    name: user.name || '',
    email: user.email,
    role: user.role,
  };
}

export async function saveContactMessage(payload: Record<string, unknown>) {
  await connectToDatabase();
  await Contact.create(payload);
}
