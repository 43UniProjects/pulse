export const USER_ROLE = ['admin', 'donor', 'hospital', 'guest'] as const;
export type UserRole = (typeof USER_ROLE)[number];

export interface UserEntity {
  _id?: string;
  name?: string | null;
  email: string;
  emailVerified?: Date | null;
  image?: string | null;

  role: UserRole;
  isActive: boolean;
  password?: string;

  createdAt?: Date;
  updatedAt?: Date;
}
