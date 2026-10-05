import mongoose, { Schema, Document, Model } from 'mongoose';
import { AdminEntity, ADMIN_ROLES, ADMIN_STATUS } from '@/types/admin.type';

export interface IAdminDocument extends Omit<AdminEntity, '_id'>, Document {
  _id: mongoose.Types.ObjectId;
}

const AdminSchema = new Schema<IAdminDocument>(
  {
    _id: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    fullName: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    phone: { type: String, trim: true },
    role: {
      type: String,
      enum: ADMIN_ROLES,
      default: 'clinical_verifier',
      index: true,
    },
    status: {
      type: String,
      enum: ADMIN_STATUS,
      default: 'active',
      index: true,
    },
    department: { type: String, default: 'Operations' },
    lastLoginAt: { type: Date, default: null },
    actionsLogged: { type: Number, default: 0 },
  },
  {
    timestamps: true,
  },
);

export const Admin: Model<IAdminDocument> =
  mongoose.models.Admin || mongoose.model<IAdminDocument>('Admin', AdminSchema);
