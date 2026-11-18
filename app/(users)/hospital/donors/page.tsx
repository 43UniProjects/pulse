import { Metadata } from 'next';
import { validateRoleAccess } from '@/lib/auth/guard';
import { connectToDatabase } from '@/lib/db/connect';
import { Donor } from '@/lib/models/donor.model';
import DonorsClient, { SerializedDonor } from './donors-client';

export const dynamic = 'force-dynamic';
export const instant = false;

export const metadata: Metadata = {
  title: 'Registered Donors | Pulse',
  description: 'View registered donors and manage health verifications.',
};

export default async function RegisteredDonorsPage() {
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
