import { Suspense } from 'react';
import RequestDetailClient from '@/app/(users)/donor/requests/[id]/request-details-form';
import GenericFallback from '@/components/fallback';
import { validateRoleAccess } from '@/lib/auth/guard';
import { getDonationRequest } from '@/app/(users)/donor/requests/data';

async function RequestDetailContent({ id }: { id: string }) {
  await validateRoleAccess('donor');
  const request = await getDonationRequest(id);

  return <RequestDetailClient initialRequest={request} />;
}

export default async function RequestPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <Suspense fallback={<GenericFallback />}>
      <RequestDetailContent id={id} />
    </Suspense>
  );
}
