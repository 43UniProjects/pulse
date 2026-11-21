import mongoose, { Schema, Document, Model, Types } from 'mongoose';
import { PointSchema } from '@/lib/models/common.models';
import { BLOOD_GROUPS } from '@/types/common.type';
import {
  DonationRequestEntity,
  REQUEST_URGENCY_LEVEL,
  REQUEST_STATUS,
} from '@/types/donor-request.type';

export interface IDonationRequestDocument
  extends
    Omit<
      DonationRequestEntity,
      | '_id'
      | 'requestId'
      | 'hospitalId'
      | 'distance'
      | 'timePosted'
      | 'notes'
      | 'matchedDonorsCount'
      | 'notifiedDonors'
      | 'fulfilledBy'
      | 'createdAt'
      | 'updatedAt'
    >,
    Document {
  _id: Types.ObjectId;
  requestId: string;
  hospitalId: Types.ObjectId;
  notes?: string;
  matchedDonorsCount: number;
  notifiedDonors: Types.ObjectId[];
  fulfilledBy?: Types.ObjectId | null;
  createdAt?: Date;
  updatedAt?: Date;
}

const DonationRequestSchema = new Schema<IDonationRequestDocument>(
  {
    requestId: { type: String, required: true, unique: true },
    hospitalId: {
      type: Schema.Types.ObjectId,
      ref: 'Hospital',
      required: true,
      index: true,
    },
    hospitalName: { type: String, required: true },
    address: { type: String, required: true },

    // GeoJSON schema structure for broadcasting and spatial calculations
    location: {
      type: PointSchema,
      required: true,
    },

    bloodGroup: {
      type: String,
      enum: BLOOD_GROUPS,
      required: true,
      index: true,
    },
    quantity: { type: Number, required: true },
    urgency: {
      type: String,
      enum: REQUEST_URGENCY_LEVEL,
      default: REQUEST_URGENCY_LEVEL[0],
      index: true,
    },
    status: {
      type: String,
      enum: REQUEST_STATUS,
      default: REQUEST_STATUS[0],
      index: true,
    },
    radiusKm: { type: Number, default: 10 },
    notes: { type: String, trim: true },
    matchedDonorsCount: { type: Number, default: 0 },
    notifiedDonors: [{ type: Schema.Types.ObjectId, ref: 'Donor' }],
    fulfilledBy: { type: Schema.Types.ObjectId, ref: 'Donor', default: null },
  },
  {
    timestamps: true,
  },
);

// Geospatial index for fast proximity lookups matching donors to requests
DonationRequestSchema.index({ location: '2dsphere' });
DonationRequestSchema.index({ status: 1, bloodGroup: 1, urgency: -1 });
DonationRequestSchema.index({ hospitalId: 1, createdAt: -1 });
DonationRequestSchema.index({ status: 1, createdAt: -1 });
DonationRequestSchema.index({ status: 1, notifiedDonors: 1 });

export const DonationRequest: Model<IDonationRequestDocument> =
  mongoose.models.DonationRequest ||
  mongoose.model<IDonationRequestDocument>(
    'DonationRequest',
    DonationRequestSchema,
  );
