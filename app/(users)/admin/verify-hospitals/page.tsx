import { Suspense } from 'react';
import { validateRoleAccess } from '@/lib/auth/guard';
import { connectToDatabase } from '@/lib/db/connect';
import { Hospital } from '@/lib/models/hospital.model';
import { HospitalEntity } from '@/types/hospital.type';
import GenericFallback from '@/components/fallback';
import VerifyHospitalsClient, {
  SerializedHospitalVerification,
  HospitalStatus,
} from '@/app/(users)/admin/verify-hospitals/verify-hospitals-client';

async function VerifyHospitalsContent() {
  await validateRoleAccess('admin');
  await connectToDatabase();

  const rawHospitals = await Hospital.find()
    .select('name email verificationStatus createdAt')
    .sort({ createdAt: -1 })
    .limit(200)
    .lean<HospitalEntity[]>();

  const initialHospitals: SerializedHospitalVerification[] = rawHospitals.map(
    (h) => {
      const createdAt = h.createdAt ? new Date(h.createdAt) : new Date();
      const year = createdAt.getFullYear();
      const hospitalId = (h._id ?? '').toString();
      const shortId = hospitalId.slice(-5).toUpperCase();
      const regNo = `LK/${year}/${shortId}`;

      let status: HospitalStatus = 'Pending';
      if (h.verificationStatus === 'verified') status = 'Approved';
      else if (h.verificationStatus === 'rejected') status = 'Rejected';

      const dateStr = new Intl.DateTimeFormat('en-GB', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      }).format(createdAt);

      return {
        id: hospitalId,
        name: h.name || 'Unnamed Hospital',
        regNo,
        email: h.email || 'No email provided',
        date: dateStr,
        status,
      };
    },
  );

  return <VerifyHospitalsClient initialHospitals={initialHospitals} />;
}

export default function VerifyHospitalsPage() {
  return (
    <Suspense fallback={<GenericFallback />}>
      <VerifyHospitalsContent />
    </Suspense>
  );
}
