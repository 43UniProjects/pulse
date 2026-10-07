import { Metadata } from 'next';
import { getDonorProfile, getDonationHistory } from '../requests/data';
import { DONATION_STATUS } from '@/types/donation.type';
import DonorProfileClient from './profile-client';

export const metadata: Metadata = {
  title: 'My Profile | Pulse',
  description: 'Manage your donor profile and availability.',
};

export default async function DonorProfilePage() {
  const donorId = 'donor_1';

  // Fetch from the data layer instead of hardcoding
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
    <div className="max-w-5xl mx-auto w-full space-y-6">
      <DonorProfileClient
        initialData={donor}
        historyCount={history.length}
        completedDonations={completedDonations}
      />
    </div>
  );
}
