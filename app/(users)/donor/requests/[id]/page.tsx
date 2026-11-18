import { Suspense } from 'react';
import RequestDetailClient from './request-details-form';
import GenericFallback from '@/components/fallback';
import { getDonationRequest } from '../data';

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
