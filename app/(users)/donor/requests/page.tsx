import { Metadata } from 'next';
import { validateRoleAccess } from '@/lib/auth/guard';
import {
  getDonationRequests,
  getDonationHistory,
  getDonorProfile,
} from './data';
import RequestsClient from './requests-client';

export const metadata: Metadata = {
  title: 'Emergency Requests | Pulse',
  description: 'Manage nearby active emergencies and view your past donations.',
};

export default async function DonorRequestsPage() {
  const session = await validateRoleAccess('donor');

  const [activeRequests, historyRequests, donorProfile] = await Promise.all([
    getDonationRequests(),
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
