import { Metadata } from 'next';
import { Suspense } from 'react';
import { validateRoleAccess } from '@/lib/auth/guard';
import GenericFallback from '@/components/fallback';
import PostRequestClient from './post-request-client';

export const metadata: Metadata = {
  title: 'Post Blood Request | Pulse',
  description: 'Broadcast an emergency request to eligible nearby donors.',
};

async function PostRequestContent() {
  await validateRoleAccess('hospital');
  return <PostRequestClient />;
}

export default function PostRequestPage() {
  return (
    <Suspense fallback={<GenericFallback />}>
      <PostRequestContent />
    </Suspense>
  );
}
