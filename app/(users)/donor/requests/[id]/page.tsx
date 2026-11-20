import { Suspense } from 'react';
import RequestDetailClient from '@/app/(users)/donor/requests/[id]/request-details-form';
import GenericFallback from '@/components/fallback';
import { getDonationRequest } from '@/app/(users)/donor/requests/data';

export default async function RequestPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const request = await getDonationRequest(id);

  return (
    <Suspense fallback={<GenericFallback />}>
      <RequestDetailClient initialRequest={request} />
    </Suspense>
  );
}
