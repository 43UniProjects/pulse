import mongoose, { Schema, Document, Model, Types } from 'mongoose';
import {
  PushSubscriptionEntity,
  PushSubscriptionKeys,
} from '@/types/push-subscription.type';

export interface IPushSubscriptionDocument
  extends
    Omit<PushSubscriptionEntity, '_id' | 'donorId' | 'createdAt' | 'updatedAt'>,
    Document {
  _id: Types.ObjectId;
  donorId: Types.ObjectId;
  createdAt?: Date;
  updatedAt?: Date;
}

const PushSubscriptionKeysSchema = new Schema<PushSubscriptionKeys>(
  {
    p256dh: {
      type: String,
      required: true,
      trim: true,
    },
    auth: {
      type: String,
      required: true,
      trim: true,
    },
  },
  { _id: false },
);

const PushSubscriptionSchema = new Schema<IPushSubscriptionDocument>(
  {
    donorId: {
      type: Schema.Types.ObjectId,
      ref: 'Donor',
      required: true,
      index: true,
    },
    endpoint: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    expirationTime: {
      type: Number,
      default: null,
    },
    keys: {
      type: PushSubscriptionKeysSchema,
      required: true,
    },
    userAgent: {
      type: String,
      trim: true,
      default: '',
    },
  },
  {
    timestamps: true,
  },
);

export const PushSubscription: Model<IPushSubscriptionDocument> =
  mongoose.models.PushSubscription ||
  mongoose.model<IPushSubscriptionDocument>(
    'PushSubscription',
    PushSubscriptionSchema,
  );
