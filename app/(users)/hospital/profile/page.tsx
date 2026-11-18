import { Metadata } from 'next';
import { validateRoleAccess } from '@/lib/auth/guard';
import { connectToDatabase } from '@/lib/db/connect';
import { Hospital } from '@/lib/models/hospital.model';
import { HospitalEntity } from '@/types/hospital.type';
import HospitalProfileClient from './hospital-profile-client';

export const metadata: Metadata = {
  title: 'Facility Profile | Pulse',
  description: 'Manage your hospital profile and coordinator details.',
};

export default async function HospitalProfilePage() {
  const session = await validateRoleAccess('hospital', { allowInactive: true });
  await connectToDatabase();

  let hospitalDoc = await Hospital.findById(session.user.id).lean();

  if (!hospitalDoc) {
    const created = await Hospital.create({
      _id: session.user.id,
      name: session.user.name || '',
      facilityType: 'private_hospital',
      verificationStatus: 'pending',
      address: '',
      city: '',
      location: { type: 'Point', coordinates: [79.8612, 6.9271] },
      hotline: '',
      email: session.user.email,
      coordinator: {
        name: '',
        designation: '',
        contactNumber: '',
        email: session.user.email,
      },
      activeRequestsCount: 0,
    });
    hospitalDoc = created.toObject();
  }

  const serializedHospital = {
    ...hospitalDoc,
    _id: hospitalDoc._id.toString(),
    verifiedBy: hospitalDoc.verifiedBy
      ? hospitalDoc.verifiedBy.toString()
      : null,
    verifiedAt: hospitalDoc.verifiedAt
      ? new Date(hospitalDoc.verifiedAt)
      : null,
    createdAt: hospitalDoc.createdAt
      ? new Date(hospitalDoc.createdAt)
      : undefined,
    updatedAt: hospitalDoc.updatedAt
      ? new Date(hospitalDoc.updatedAt)
      : undefined,
  } as unknown as HospitalEntity;

  return (
    <div className="max-w-5xl mx-auto w-full space-y-6">
      <HospitalProfileClient initialData={serializedHospital} />
    </div>
  );
}
