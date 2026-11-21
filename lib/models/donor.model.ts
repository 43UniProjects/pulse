import mongoose, { Schema, Document, Model } from 'mongoose';
import { PointSchema } from '@/lib/models/common.models';
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
    fullName: { type: String, default: '', trim: true },
    email: { type: String, required: true, lowercase: true },
    phone: { type: String, default: '' },
    bloodGroup: {
      type: String,
      enum: [...BLOOD_GROUPS, ''],
      default: '',
      index: true,
    },
    dateOfBirth: { type: Date, default: null },
    address: { type: String, default: '' },
    location: {
      type: PointSchema,
      default: () => ({ type: 'Point', coordinates: [79.8612, 6.9271] }),
    },
    radiusPreferenceKm: { type: Number, default: 10 },
    lastDonationDate: { type: Date, default: null },
    isEligible: { type: Boolean, default: true, index: true },
    isAvailable: { type: Boolean, default: true },
    liveLocationSync: { type: Boolean, default: false },
    lastLocationUpdatedAt: { type: Date, default: null },
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
