import { Metadata } from 'next';

import Footer from '@/components/footer';
import Header from '@/components/header/main';
import { Suspense } from 'react';
import GenericFallback from '@/components/fallback';
import VerifyEmailForm from './verify-email-form';

export const metadata: Metadata = {
  title: 'Verify Email',
  description: 'Check your inbox to verify your Pulse account.',
};

export default async function VerifyEmailPage() {
  return (
    <>
      <Header />
      <main className="flex-1 flex items-center justify-center p-6 py-12 relative w-full">
        <Suspense fallback={<GenericFallback />}>
          <VerifyEmailForm />
        </Suspense>
      </main>
      <Footer />
    </>
  );
}
