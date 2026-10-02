import mongoose, { Schema, Document, Model } from 'mongoose';
import { AdminEntity } from '@/types/admin.type';

export interface IAdminDocument extends Omit<AdminEntity, '_id'>, Document {}

const AdminSchema = new Schema<IAdminDocument>(
  {
    userId: { type: String, required: true, unique: true, index: true },
    fullName: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    phone: { type: String, trim: true },
    role: {
      type: String,
      enum: ['superadmin', 'clinical_verifier', 'support'],
      default: 'clinical_verifier',
      index: true,
    },
    status: {
      type: String,
      enum: ['active', 'suspended', 'deactivated'],
      default: 'active',
      index: true,
    },
    department: { type: String, default: 'Operations' },
    lastLoginAt: { type: Date, default: null },
  },
  {
    timestamps: true,
  },
);

export const Admin: Model<IAdminDocument> =
  mongoose.models.Admin || mongoose.model<IAdminDocument>('Admin', AdminSchema);
