import { Metadata } from 'next';
import { Suspense } from 'react';
import { validateRoleAccess } from '@/lib/auth/guard';
import { connectToDatabase } from '@/lib/db/connect';
import { Donor } from '@/lib/models/donor.model';
import GenericFallback from '@/components/fallback';
import DonorsClient, { SerializedDonor } from './donors-client';

export const metadata: Metadata = {
  title: 'Registered Donors | Pulse',
  description: 'View registered donors and manage health verifications.',
};

async function RegisteredDonorsContent() {
  await validateRoleAccess('hospital');
  await connectToDatabase();

  const donorsRaw = await Donor.find().sort({ createdAt: -1 }).lean();

  const serializedDonors: SerializedDonor[] = donorsRaw.map((d) => ({
    _id: d._id.toString(),
    name: d.fullName,
    bloodGroup: d.bloodGroup,
    phone: d.phone,
    address: d.address,
    registered: d.createdAt
      ? new Intl.DateTimeFormat('en-GB', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
        }).format(new Date(d.createdAt))
      : 'Recently',
    verified: Boolean(d.isEligible),
  }));

  return <DonorsClient initialDonors={serializedDonors} />;
}

export default function RegisteredDonorsPage() {
  return (
    <Suspense fallback={<GenericFallback />}>
      <RegisteredDonorsContent />
    </Suspense>
  );
}
