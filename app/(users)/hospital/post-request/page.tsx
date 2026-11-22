import { Metadata } from 'next';
import { Suspense } from 'react';
import { validateRoleAccess } from '@/lib/auth/guard';
import { connectToDatabase } from '@/lib/db/connect';
import { Hospital } from '@/lib/models/hospital.model';
import GenericFallback from '@/components/fallback';
import PostRequestClient from '@/app/(users)/hospital/post-request/post-request-client';

export const metadata: Metadata = {
  title: 'Post Blood Request | Pulse',
  description: 'Broadcast an emergency request to eligible nearby donors.',
};

async function PostRequestContent() {
  const session = await validateRoleAccess('hospital');
  await connectToDatabase();

  const hospital = await Hospital.findById(session.user.id)
    .select('name address city verificationStatus')
    .lean();

  const hospitalName = hospital?.name?.trim() || session.user.name || '';
  const hospitalLocationLabel = [
    hospital?.address?.trim(),
    hospital?.city?.trim(),
  ]
    .filter(Boolean)
    .join(', ');

  const isVerified = hospital?.verificationStatus === 'verified';
  const verificationStatus = hospital?.verificationStatus || 'pending';

  return (
    <PostRequestClient
      hospitalName={hospitalName}
      hospitalLocationLabel={hospitalLocationLabel}
      isVerified={isVerified}
      verificationStatus={verificationStatus}
    />
  );
}

export default function PostRequestPage() {
  return (
    <Suspense fallback={<GenericFallback />}>
      <PostRequestContent />
    </Suspense>
  );
}
