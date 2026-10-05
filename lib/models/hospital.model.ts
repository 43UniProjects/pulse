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
    name: { type: String, required: true, trim: true },
    designation: { type: String, required: true, trim: true },
    contactNumber: { type: String, required: true },
    email: { type: String, required: true, lowercase: true, trim: true },
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
    name: { type: String, required: true, trim: true },
    facilityType: {
      type: String,
      enum: HOSPITAL_TYPE,
      default: 'private_hospital',
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
    address: { type: String, required: true },
    city: { type: String, required: true, index: true },
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point',
      },
      coordinates: {
        type: [Number],
        required: true,
      },
    },
    hotline: { type: String, required: true },
    email: { type: String, required: true, lowercase: true },
    website: { type: String, trim: true },
    coordinator: { type: CoordinatorSchema, required: true },
    activeRequestsCount: { type: Number, default: 0 },
  },
  {
    timestamps: true,
  },
);

HospitalSchema.index({ location: '2dsphere' });
HospitalSchema.index({ verificationStatus: 1, city: 1 });

export const Hospital: Model<IHospitalDocument> =
  mongoose.models.Hospital ||
  mongoose.model<IHospitalDocument>('Hospital', HospitalSchema);
