import mongoose, { Schema, Document, Model } from 'mongoose';
import { PointSchema } from './common.models';
import { BLOOD_GROUPS } from '@/types/common.type';
import { DonorEntity } from '@/types/donor.type';

export interface IDonorDocument
  extends Omit<DonorEntity, '_id' | 'history'>, Document {
  _id: mongoose.Types.ObjectId;
  history: mongoose.Types.ObjectId[];
}

const DonorSchema = new Schema<IDonorDocument>(
  {
    _id: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    fullName: { type: String, required: true, trim: true },
    email: { type: String, required: true, lowercase: true },
    phone: { type: String, required: true },
    bloodGroup: {
      type: String,
      enum: BLOOD_GROUPS,
      required: true,
      index: true,
    },
    dateOfBirth: { type: Date, required: true },
    address: { type: String, required: true },
    location: {
      type: PointSchema,
      required: true,
    },
    radiusPreferenceKm: { type: Number, default: 10 },
    lastDonationDate: { type: Date, default: null },
    isEligible: { type: Boolean, default: true, index: true },
    isAvailable: { type: Boolean, default: true },
    liveLocationSync: { type: Boolean, default: false },
    smsAlertsEnabled: { type: Boolean, default: true },
    emailAlertsEnabled: { type: Boolean, default: false },
    history: [
      {
        type: Schema.Types.ObjectId,
        ref: 'DonationRequest',
      },
    ],
  },
  {
    timestamps: true,
  },
);

DonorSchema.index({ location: '2dsphere' });
DonorSchema.index({ bloodGroup: 1, isEligible: 1, isAvailable: 1 });

export const Donor: Model<IDonorDocument> =
  mongoose.models.Donor || mongoose.model<IDonorDocument>('Donor', DonorSchema);
