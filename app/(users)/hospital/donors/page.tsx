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
  title: 'Registered Donors | Pulse',
  description: 'View registered donors and manage health verifications.',
};

async function RegisteredDonorsContent() {
  const session = await validateRoleAccess('hospital');
  await connectToDatabase();

  const hospital = await Hospital.findById(session.user.id)
    .select('verificationStatus')
    .lean();

  if (hospital?.verificationStatus !== 'verified') {
    return (
      <div className="p-8 max-w-3xl mx-auto">
        <div className="bg-card border border-amber-500/30 rounded-xl p-8 text-center space-y-2 shadow-sm">
          <h1 className="font-display font-bold text-xl text-foreground">
            Facility Verification Required
          </h1>
          <p className="text-sm text-muted-foreground">
            Your hospital account must be verified by an administrator before
            you can access the registered donor directory.
          </p>
        </div>
      </div>
    );
  }

  const donorsRaw = await Donor.find()
    .select('fullName bloodGroup phone address createdAt isEligible')
    .sort({ createdAt: -1 })
    .limit(200)
    .lean();

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
