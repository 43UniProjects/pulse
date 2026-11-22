import { Metadata } from 'next';
import { Suspense } from 'react';
import { validateRoleAccess } from '@/lib/auth/guard';
import {
  getDonationRequests,
  getDonationHistory,
  getDonorProfile,
} from '@/app/(users)/donor/requests/data';
import GenericFallback from '@/components/fallback';
import RequestsClient from '@/app/(users)/donor/requests/requests-client';

export const metadata: Metadata = {
  title: 'Emergency Requests',
  description: 'Manage nearby active emergencies and view your past donations.',
};

async function DonorRequestsContent() {
  const session = await validateRoleAccess('donor');

  const [activeRequests, historyRequests, donorProfile] = await Promise.all([
    getDonationRequests(session.user.id),
    getDonationHistory(session.user.id),
    getDonorProfile(session.user.id),
  ]);

  return (
    <RequestsClient
      initialActiveRequests={activeRequests}
      initialHistoryRequests={historyRequests}
      radiusKm={donorProfile?.radiusPreferenceKm || 10}
    />
  );
}

export default function DonorRequestsPage() {
  return (
    <Suspense fallback={<GenericFallback />}>
      <DonorRequestsContent />
    </Suspense>
  );
}
