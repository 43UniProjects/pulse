import { Metadata } from 'next';
import { Suspense } from 'react';
import { validateRoleAccess } from '@/lib/auth/guard';
import { connectToDatabase } from '@/lib/db/connect';
import { Hospital } from '@/lib/models/hospital.model';
import { HospitalEntity } from '@/types/hospital.type';
import GenericFallback from '@/components/fallback';
import HospitalProfileClient from './hospital-profile-client';

export const metadata: Metadata = {
  title: 'Facility Profile',
  description: 'Manage your hospital profile and coordinator details.',
};

async function HospitalProfileContent() {
  const session = await validateRoleAccess('hospital', { allowInactive: true });
  await connectToDatabase();

  const hospitalDoc = await Hospital.findById(session.user.id).lean();

  const serializedHospital: HospitalEntity = hospitalDoc
    ? ({
        ...hospitalDoc,
        _id: hospitalDoc._id.toString(),
        location: hospitalDoc.location?.coordinates
          ? {
              type: 'Point',
              coordinates: [
                hospitalDoc.location.coordinates[0],
                hospitalDoc.location.coordinates[1],
              ],
            }
          : { type: 'Point', coordinates: [79.8612, 6.9271] },
        lastLocationUpdatedAt: hospitalDoc.lastLocationUpdatedAt
          ? new Date(hospitalDoc.lastLocationUpdatedAt)
          : null,
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
      } as unknown as HospitalEntity)
    : {
        _id: session.user.id,
        name: session.user.name || '',
        facilityType: '',
        verificationStatus: 'pending',
        verifiedAt: null,
        verifiedBy: null,
        address: '',
        city: '',
        location: { type: 'Point', coordinates: [79.8612, 6.9271] },
        lastLocationUpdatedAt: null,
        hotline: '',
        email: session.user.email,
        website: '',
        coordinator: {
          name: '',
          designation: '',
          contactNumber: '',
          email: '',
        },
        activeRequestsCount: 0,
      };

  return (
    <HospitalProfileClient
      initialData={serializedHospital}
      isAccountActive={Boolean(session.user.isActive)}
    />
  );
}

export default function HospitalProfilePage() {
  return (
    <div className="max-w-5xl mx-auto w-full space-y-6">
      <Suspense fallback={<GenericFallback />}>
        <HospitalProfileContent />
      </Suspense>
    </div>
  );
}
