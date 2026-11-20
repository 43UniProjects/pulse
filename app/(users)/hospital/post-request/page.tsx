import { Metadata } from 'next';
import { Suspense } from 'react';
import { validateRoleAccess } from '@/lib/auth/guard';
import { connectToDatabase } from '@/lib/db/connect';
import { Hospital } from '@/lib/models/hospital.model';
import GenericFallback from '@/components/fallback';
import PostRequestClient from './post-request-client';

export const metadata: Metadata = {
  title: 'Post Blood Request | Pulse',
  description: 'Broadcast an emergency request to eligible nearby donors.',
};

async function PostRequestContent() {
  const session = await validateRoleAccess('hospital');
  await connectToDatabase();

  const hospital = await Hospital.findById(session.user.id)
    .select('name address city')
    .lean();

  const hospitalName = hospital?.name?.trim() || session.user.name || '';
  const hospitalLocationLabel = [
    hospital?.address?.trim(),
    hospital?.city?.trim(),
  ]
    .filter(Boolean)
    .join(', ');

  return (
    <PostRequestClient
      hospitalName={hospitalName}
      hospitalLocationLabel={hospitalLocationLabel}
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
