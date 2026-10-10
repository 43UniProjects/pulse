import { connectToDatabase } from '@/lib/db/connect';
import { Contact } from '@/lib/models/contact.model';

export interface PreFillData {
  _id: string | null;
  name: string;
  email: string;
  role: string;
}

export async function saveContactMessage(payload: Record<string, unknown>) {
  await connectToDatabase();
  await Contact.create(payload);
}
