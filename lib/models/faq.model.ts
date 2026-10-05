import mongoose, { Schema, Document } from 'mongoose';

// What data should store in a FAQ
export interface IFaq extends Document {
  question: string;
  answer: string;
}

const FaqSchema = new Schema<IFaq>(
  {
    question: { type: String, required: true },
    answer: { type: String, required: true },
  },
  { timestamps: true },
);

// If there is a model already created, then get it, otherwise create a new one
export const Faq =
  mongoose.models.Faq || mongoose.model<IFaq>('Faq', FaqSchema);
