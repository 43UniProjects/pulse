import { Metadata } from 'next';
import { Suspense } from 'react';
import { validateRoleAccess } from '@/lib/auth/guard';
import { connectToDatabase } from '@/lib/db/connect';
import { Donor } from '@/lib/models/donor.model';
import { Hospital } from '@/lib/models/hospital.model';
import GenericFallback from '@/components/fallback';
import DonorsClient, {
  SerializedDonor,
} from '@/app/(users)/hospital/donors/donors-client';

export const metadata: Metadata = {
  title: 'Registered Donors',
  description: 'View registered donors and manage health verifications.',
};

async function RegisteredDonorsContent() {
  const session = await validateRoleAccess('hospital');
  await connectToDatabase();

  const [hospital, donorsRaw] = await Promise.all([
    Hospital.findById(session.user.id).select('verificationStatus').lean(),
    Donor.find().sort({ createdAt: -1 }).lean(),
  ]);

  const isVerified = hospital?.verificationStatus === 'verified';
  const verificationStatus = hospital?.verificationStatus || 'pending';

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

  return (
    <DonorsClient
      initialDonors={serializedDonors}
      isVerified={isVerified}
      verificationStatus={verificationStatus}
    />
  );
}

export default function RegisteredDonorsPage() {
  return (
    <Suspense fallback={<GenericFallback />}>
      <RegisteredDonorsContent />
    </Suspense>
  );
}
