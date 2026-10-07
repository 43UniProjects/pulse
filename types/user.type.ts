export const USER_ROLES = ['admin', 'donor', 'hospital'] as const;
export type UserRole = (typeof USER_ROLES)[number];

export interface UserEntity {
  _id?: string;
  name?: string | null;
  email: string;
  emailVerified?: Date | null;
  image?: string | null;

  role: UserRole;
  isActive: boolean;

  createdAt?: Date;
  updatedAt?: Date;
}
