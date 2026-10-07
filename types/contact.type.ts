import { UserEntity, UserRole } from './user.type';

export const CONTACT_STATUS = ['pending', 'reviewed', 'resolved'] as const;
export const CONTACT_TARGET = ['admin', 'developer'] as const;

export type ContactStatus = (typeof CONTACT_STATUS)[number];
export type ContactTarget = (typeof CONTACT_TARGET)[number];
export type SenderRole = UserRole | 'Guest';

export interface ContactEntity {
  _id?: string;
  userId?: string | UserEntity | null; // Null for Guests, populated for logged-in users
  senderRole: SenderRole;
  targetAudience: ContactTarget; // Dictates whose dashboard this appears on
  name: string; // Captured from form (guest) or session (user)
  email: string; // Captured from form (guest) or session (user)
  subject: string;
  message: string;
  status: ContactStatus;
  createdAt?: Date;
  updatedAt?: Date;
}
