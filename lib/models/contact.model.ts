import mongoose, { Schema, Document, Model } from 'mongoose';
import {
  ContactEntity,
  CONTACT_STATUS,
  CONTACT_TARGET,
} from '@/types/contact.type';
import { USER_ROLES } from '@/types/user.type';

export interface IContactDocument
  extends Omit<ContactEntity, '_id' | 'userId'>, Document {
  userId?: mongoose.Types.ObjectId | null;
}

const ContactSchema = new Schema<IContactDocument>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null,
      index: true,
    },
    senderRole: {
      type: String,
      enum: [...USER_ROLES, 'Guest'],
      required: true,
    },
    targetAudience: {
      type: String,
      enum: CONTACT_TARGET,
      required: true,
      index: true,
    },
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    subject: { type: String, required: true, trim: true },
    message: { type: String, required: true },
    status: {
      type: String,
      enum: CONTACT_STATUS,
      default: 'pending',
      index: true,
    },
  },
  { timestamps: true },
);

export const Contact: Model<IContactDocument> =
  mongoose.models.Contact ||
  mongoose.model<IContactDocument>('Contact', ContactSchema);
