import { Metadata } from 'next';
import { Suspense } from 'react';
import { validateRoleAccess } from '@/lib/auth/guard';
import { connectToDatabase } from '@/lib/db/connect';
import { Donor } from '@/lib/models/donor.model';
import { Donation } from '@/lib/models/donation.model';
import { DONATION_STATUS } from '@/types/donation.type';
import { DonorEntity } from '@/types/donor.type';
import GenericFallback from '@/components/fallback';
import DonorProfileClient from './profile-client';

export const metadata: Metadata = {
  title: 'My Profile | Pulse',
  description: 'Manage your donor profile and availability.',
};

async function DonorProfileContent() {
  const session = await validateRoleAccess('donor', { allowInactive: true });
  await connectToDatabase();

  const donorDoc = await Donor.findById(session.user.id).lean();

  const history = await Donation.find({ donorId: session.user.id }).lean();
  const completedDonations = history.filter(
    (req) => req.status === DONATION_STATUS[2], // 'completed'
  ).length;

  const serializedDonor: DonorEntity = donorDoc
    ? ({
        ...donorDoc,
        _id: donorDoc._id.toString(),
        dateOfBirth: donorDoc.dateOfBirth
          ? new Date(donorDoc.dateOfBirth)
          : null,
        lastDonationDate: donorDoc.lastDonationDate
          ? new Date(donorDoc.lastDonationDate)
          : null,
        lastLocationUpdatedAt: donorDoc.lastLocationUpdatedAt
          ? new Date(donorDoc.lastLocationUpdatedAt)
          : null,
        createdAt: donorDoc.createdAt
          ? new Date(donorDoc.createdAt)
          : undefined,
        updatedAt: donorDoc.updatedAt
          ? new Date(donorDoc.updatedAt)
          : undefined,
      } as unknown as DonorEntity)
    : {
        _id: session.user.id,
        fullName: session.user.name || '',
        email: session.user.email,
        phone: '',
        bloodGroup: '',
        dateOfBirth: null,
        address: '',
        location: { type: 'Point', coordinates: [79.8612, 6.9271] },
        radiusPreferenceKm: 10,
        lastDonationDate: null,
        isEligible: true,
        isAvailable: true,
        liveLocationSync: false,
        lastLocationUpdatedAt: null,
        smsAlertsEnabled: true,
        emailAlertsEnabled: false,
        history: [],
      };

  return (
    <DonorProfileClient
      initialData={serializedDonor}
      historyCount={history.length}
      completedDonations={completedDonations}
      isAccountActive={Boolean(session.user.isActive)}
    />
  );
}

export default function DonorProfilePage() {
  return (
    <div className="max-w-5xl mx-auto w-full space-y-6">
      <Suspense fallback={<GenericFallback />}>
        <DonorProfileContent />
      </Suspense>
    </div>
  );
}
