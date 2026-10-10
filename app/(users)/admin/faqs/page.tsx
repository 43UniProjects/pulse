import { Suspense } from 'react';
import { connectToDatabase } from '@/lib/db/connect';
import { Faq } from '@/lib/models/faq.model';
import FaqClient from './faq-client';
import { connection } from 'next/server';
import GenericFallback from '@/components/fallback';

async function FaqList() {
  await connection();
  await connectToDatabase();

  // Use .lean() to get plain JSON objects and sort by newest first
  const faqs = await Faq.find().sort({ createdAt: -1 }).lean();

  // Serialize the _id to string for the client component
  const serializedFaqs = faqs.map((faq) => ({
    _id: faq._id.toString(),
    question: faq.question,
    answer: faq.answer,
  }));

  return <FaqClient initialFaqs={serializedFaqs} />;
}

export default function AdminFaqsPage() {
  return (
    <div className="w-full">
      <div className="mb-6 glass rounded-xl border px-5 py-4 shadow-sm">
        <h1 className="font-display font-bold text-2xl text-foreground mb-1">
          FAQ Management
        </h1>
        <p className="text-sm text-muted-foreground">
          Manage frequently asked questions displayed on the support page. Add,
          edit, or delete FAQs directly from this dashboard.
        </p>
      </div>

      <Suspense fallback={<GenericFallback />}>
        <FaqList />
      </Suspense>
    </div>
  );
}
