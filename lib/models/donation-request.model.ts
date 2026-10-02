import mongoose, { Schema } from 'mongoose';
import { BLOOD_GROUPS } from '@/types/common.type';
import {
  REQUEST_URGENCY_LEVEL,
  REQUEST_STATUS,
} from '@/types/donor-request.type';

const DonationRequestSchema = new Schema(
  {
    requestId: { type: String, required: true, unique: true, index: true },
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
      type: { type: String, enum: ['Point'], default: 'Point' },
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
    fulfilledBy: { type: Schema.Types.ObjectId, ref: 'Donor', default: null },
  },
  {
    timestamps: true,
  },
);

// Geospatial index for fast proximity lookups matching donors to requests
DonationRequestSchema.index({ location: '2dsphere' });
DonationRequestSchema.index({ status: 1, bloodGroup: 1, urgency: -1 });

export const DonationRequest =
  mongoose.models.DonationRequest ||
  mongoose.model('DonationRequest', DonationRequestSchema);
