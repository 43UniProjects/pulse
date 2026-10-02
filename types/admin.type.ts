export type AdminRole = 'superadmin' | 'clinical_verifier' | 'support';
export type AdminStatus = 'active' | 'suspended' | 'deactivated';

export interface AdminEntity {
  _id?: string;
  userId: string; // Reference to base Auth user
  fullName: string;
  email: string;
  phone?: string;
  role: AdminRole; // Granular administrative permissions
  status: AdminStatus;
  department?: string; // e.g., "Clinical Verification Board"
  lastLoginAt?: string;
  actionsLogged?: number; // Count or counter for audit tracking
  createdAt: string;
  updatedAt: string;
}
