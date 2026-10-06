import { UserEntity } from './user.type';

export const ADMIN_ROLES = [
  'superadmin',
  'clinical_verifier',
  'support',
] as const;
export const ADMIN_STATUS = ['active', 'suspended', 'deactivated'] as const;

export type AdminRole = (typeof ADMIN_ROLES)[number];
export type AdminStatus = (typeof ADMIN_STATUS)[number];

export interface AdminEntity {
  _id: string | UserEntity; // Shared Primary Key

  fullName: string;
  email: string;
  phone?: string;
  role: AdminRole;
  status: AdminStatus;
  department?: string;
  lastLoginAt?: Date | null;
  actionsLogged?: number;
  createdAt?: Date;
  updatedAt?: Date;
}
