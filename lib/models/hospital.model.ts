import mongoose, { Schema, Document, Model } from 'mongoose';
import {
  HospitalEntity,
  HOSPITAL_TYPE,
  VERIFICATION_STATUS,
} from '@/types/hospital.type';

export interface IHospitalDocument
  extends Omit<HospitalEntity, '_id' | 'verifiedBy'>, Document {
  _id: mongoose.Types.ObjectId;
  verifiedBy?: mongoose.Types.ObjectId | null;
}

const CoordinatorSchema = new Schema(
  {
    name: { type: String, default: '', trim: true },
    designation: { type: String, default: '', trim: true },
    contactNumber: { type: String, default: '' },
    email: { type: String, default: '', lowercase: true, trim: true },
  },
  { _id: false },
);

const HospitalSchema = new Schema<IHospitalDocument>(
  {
    _id: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    name: { type: String, default: '', trim: true },
    facilityType: {
      type: String,
      enum: [...HOSPITAL_TYPE, ''],
      default: '',
    },
    verificationStatus: {
      type: String,
      enum: VERIFICATION_STATUS,
      default: 'pending',
      index: true,
    },
    verifiedAt: { type: Date, default: null },
    verifiedBy: {
      type: Schema.Types.ObjectId,
      ref: 'Admin',
      default: null,
    },
    address: { type: String, default: '' },
    city: { type: String, default: '', index: true },
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point',
      },
      coordinates: {
        type: [Number],
        default: [79.8612, 6.9271],
      },
    },
    lastLocationUpdatedAt: { type: Date, default: null },
    hotline: { type: String, default: '' },
    email: { type: String, required: true, lowercase: true },
    website: { type: String, trim: true, default: '' },
    coordinator: {
      type: CoordinatorSchema,
      default: () => ({
        name: '',
        designation: '',
        contactNumber: '',
        email: '',
      }),
    },
    activeRequestsCount: { type: Number, default: 0 },
  },
  {
    timestamps: true,
  },
);

HospitalSchema.index({ location: '2dsphere' });
HospitalSchema.index({ verificationStatus: 1, city: 1 });
HospitalSchema.index({ verificationStatus: 1, createdAt: -1 });

export const Hospital: Model<IHospitalDocument> =
  mongoose.models.Hospital ||
  mongoose.model<IHospitalDocument>('Hospital', HospitalSchema);
