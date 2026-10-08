import mongoose, { Schema, Document, Model } from 'mongoose';
import { UserEntity, USER_ROLE } from '@/types/user.type';
import bcrypt from 'bcryptjs';

export interface IUserDocument extends Omit<UserEntity, '_id'>, Document {}

const UserSchema = new Schema<IUserDocument>(
  {
    name: {
      type: String,
      trim: true,
      default: null,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    emailVerified: {
      type: Date,
      default: null,
    },
    image: {
      type: String,
      default: null,
    },
    role: {
      type: String,
      enum: USER_ROLE,
      required: true,
      index: true,
    },
    isActive: {
      type: Boolean,
      default: false,
    },
    password: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

// Triggered on User.create() and user.save()
UserSchema.pre('save', async function () {
  if (!this.isModified('password')) return;

  this.password = await bcrypt.hash(this.password as string, 12);
});

// Triggered on User.findOneAndUpdate() or User.findByIdAndUpdate()
UserSchema.pre('findOneAndUpdate', async function () {
  const update = this.getUpdate() as {
    password?: string;
    [key: string]: unknown;
  } | null;

  if (update?.password) {
    update.password = await bcrypt.hash(update.password, 12);
  }
});

export const User: Model<IUserDocument> =
  mongoose.models.User || mongoose.model<IUserDocument>('User', UserSchema);
