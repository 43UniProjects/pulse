import mongoose, { Schema, Document, Model } from 'mongoose';
import { HospitalEntity } from '@/types/hospital.type';

export interface IHospitalDocument
  extends Omit<HospitalEntity, '_id'>, Document {}

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
    userId: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true, trim: true },
    licenseNumber: { type: String, required: true, unique: true, trim: true },
    facilityType: {
      type: String,
      enum: ['government_hospital', 'private_hospital', 'blood_bank', 'clinic'],
      default: 'private_hospital',
    },
    verificationStatus: {
      type: String,
      enum: ['pending', 'verified', 'rejected', 'suspended'],
      default: 'pending',
      index: true,
    },
    verifiedAt: { type: Date, default: null },
    verifiedBy: { type: Schema.Types.ObjectId, ref: 'Admin', default: null },
    address: { type: String, required: true },
    city: { type: String, required: true, index: true },
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point',
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        required: true,
      },
    },
    hotline: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    website: { type: String, trim: true },
    coordinator: { type: CoordinatorSchema, required: true },
  },
  {
    timestamps: true,
  },
);

// Critical for geospatial queries ($near, $geoWithin) matching hospitals with donors
HospitalSchema.index({ location: '2dsphere' });
HospitalSchema.index({ verificationStatus: 1, city: 1 });

export const Hospital: Model<IHospitalDocument> =
  mongoose.models.Hospital ||
  mongoose.model<IHospitalDocument>('Hospital', HospitalSchema);
