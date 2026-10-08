import { connection } from 'next/server';
import { connectToDatabase } from '@/lib/db/connect';
import { Faq } from '@/lib/models/faq.model';

export interface SerializedFaq {
  _id: string;
  question: string;
  answer: string;
}

export async function getFaqs(): Promise<SerializedFaq[]> {
  // Opt into dynamic rendering to safely bypass Mongoose build-time constraints
  await connection();

  await connectToDatabase();

  const faqs = await Faq.find({}).sort({ createdAt: 1 }).lean();

  return faqs.map((faq) => ({
    _id: String(faq._id),
    question: faq.question,
    answer: faq.answer,
  }));
}
