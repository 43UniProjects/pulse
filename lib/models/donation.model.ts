import mongoose, { Schema, Document, Model, Types } from 'mongoose';
import { BLOOD_GROUPS } from '@/types/common.type';
import {
  DONATION_STATUS,
  SCREENING_STATUS,
  DonationEntity,
  ScreeningStatus,
} from '@/types/donation.type';

export interface ScreeningResults {
  hiv: ScreeningStatus;
  hepatitisB: ScreeningStatus;
  hepatitisC: ScreeningStatus;
  syphilis: ScreeningStatus;
  hemoglobinLevel?: string;
}

export interface IDonationDocument
  extends
    Omit<
      DonationEntity,
      | '_id'
      | 'donorId'
      | 'hospitalId'
      | 'requestId'
      | 'donationDate'
      | 'expiryDate'
    >,
    Document {
  donorId: Types.ObjectId;
  hospitalId: Types.ObjectId;
  requestId?: Types.ObjectId | null;
  donationDate: Date;
  expiryDate?: Date;
}

// 3. Sub-schema for Screening
const ScreeningResultsSchema = new Schema<ScreeningResults>(
  {
    hiv: {
      type: String,
      enum: SCREENING_STATUS,
      default: SCREENING_STATUS[0],
    },
    hepatitisB: {
      type: String,
      enum: SCREENING_STATUS,
      default: SCREENING_STATUS[0],
    },
    hepatitisC: {
      type: String,
      enum: SCREENING_STATUS,
      default: SCREENING_STATUS[0],
    },
    syphilis: {
      type: String,
      enum: SCREENING_STATUS,
      default: SCREENING_STATUS[0],
    },
    hemoglobinLevel: { type: String, trim: true },
  },
  { _id: false },
);

// 4. Schema Definition
const DonationSchema = new Schema<IDonationDocument>(
  {
    donationId: { type: String, required: true, unique: true, index: true },
    requestId: {
      type: Schema.Types.ObjectId,
      ref: 'DonationRequest',
      default: null,
    },
    donorId: {
      type: Schema.Types.ObjectId,
      ref: 'Donor',
      required: true,
      index: true,
    },
    hospitalId: {
      type: Schema.Types.ObjectId,
      ref: 'Hospital',
      required: true,
      index: true,
    },
    bloodGroup: {
      type: String,
      enum: BLOOD_GROUPS,
      required: true,
    },
    units: {
      type: Number,
      required: true,
      default: 1,
      min: 1,
    },
    status: {
      type: String,
      enum: DONATION_STATUS,
      default: DONATION_STATUS[0],
      index: true,
    },
    donationDate: { type: Date, required: true, default: Date.now },
    expiryDate: { type: Date },
    batchNumber: { type: String, trim: true, index: true },
    clinicalNotes: { type: String, trim: true },
    screeningResults: {
      type: ScreeningResultsSchema,
      default: () => ({}),
    },
  },
  {
    timestamps: true,
  },
);

DonationSchema.index({ donorId: 1, donationDate: -1 });
DonationSchema.index({ hospitalId: 1, status: 1 });

export const Donation: Model<IDonationDocument> =
  mongoose.models.Donation ||
  mongoose.model<IDonationDocument>('Donation', DonationSchema);
