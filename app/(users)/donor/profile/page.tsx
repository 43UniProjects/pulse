import { Metadata } from 'next';
import { validateRoleAccess } from '@/lib/auth/guard';
import { connectToDatabase } from '@/lib/db/connect';
import { Donor } from '@/lib/models/donor.model';
import { Donation } from '@/lib/models/donation.model';
import { DONATION_STATUS } from '@/types/donation.type';
import { DonorEntity } from '@/types/donor.type';
import DonorProfileClient from './profile-client';

export const dynamic = 'force-dynamic';
export const instant = false;

export const metadata: Metadata = {
  title: 'My Profile | Pulse',
  description: 'Manage your donor profile and availability.',
};

export default async function DonorProfilePage() {
  const session = await validateRoleAccess('donor');
  await connectToDatabase();

  let donorDoc = await Donor.findById(session.user.id).lean();

  if (!donorDoc) {
    const created = await Donor.create({
      _id: session.user.id,
      fullName: session.user.name || 'Verified Donor',
      email: session.user.email,
      phone: '+94 77 000 0000',
      bloodGroup: 'O+',
      dateOfBirth: new Date('2000-01-01'),
      address: 'Colombo, Sri Lanka',
      location: { type: 'Point', coordinates: [79.8612, 6.9271] },
      radiusPreferenceKm: 10,
      isEligible: true,
      isAvailable: true,
      liveLocationSync: false,
      smsAlertsEnabled: true,
      emailAlertsEnabled: false,
    });
    donorDoc = created.toObject();
  }

  const history = await Donation.find({ donorId: session.user.id }).lean();
  const completedDonations = history.filter(
    (req) => req.status === DONATION_STATUS[2], // 'completed'
  ).length;

  const serializedDonor = {
    ...donorDoc,
    _id: donorDoc._id.toString(),
    dateOfBirth: donorDoc.dateOfBirth
      ? new Date(donorDoc.dateOfBirth)
      : new Date('2000-01-01'),
    lastDonationDate: donorDoc.lastDonationDate
      ? new Date(donorDoc.lastDonationDate)
      : null,
    createdAt: donorDoc.createdAt ? new Date(donorDoc.createdAt) : undefined,
    updatedAt: donorDoc.updatedAt ? new Date(donorDoc.updatedAt) : undefined,
  } as unknown as DonorEntity;

  return (
    <div className="max-w-5xl mx-auto w-full space-y-6">
      <DonorProfileClient
        initialData={serializedDonor}
        historyCount={history.length}
        completedDonations={completedDonations}
      />
    </div>
  );
}
