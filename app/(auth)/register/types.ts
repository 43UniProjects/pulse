export const ACCOUNT_TYPE = ['donor', 'hospital'] as const;

export type AccountType = (typeof ACCOUNT_TYPE)[number];

export interface RegistrationPayload {
  email: string;
  password: string;
  name: string;
  role: AccountType;
}
