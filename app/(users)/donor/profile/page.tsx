import { Metadata } from 'next';
import { getDonorProfile, getDonationHistory } from '../requests/data';
import { DONATION_STATUS } from '@/types/donation.type';
import ProfileClient from './profile-client';

export const metadata: Metadata = {
  title: 'My Profile | Pulse',
  description: 'Manage your donor profile and availability.',
};

export default async function DonorProfilePage() {
  // In a real app, you would get the ID from the session/JWT cookie
  const donorId = 'donor_1';
  const donor = getDonorProfile(donorId);
  const history = getDonationHistory(donorId);

  // Calculate stats securely on the server
  const completedDonations = history.filter(
    (req) => req.status === DONATION_STATUS[2], // 'completed'
  ).length;

  if (!donor) {
    return (
      <div className="flex items-center justify-center h-[60vh] text-muted-foreground">
        Profile data not found.
      </div>
    );
  }

  return (
    <ProfileClient
      donor={donor}
      completedDonations={completedDonations}
      historyLength={history.length}
    />
  );
}
