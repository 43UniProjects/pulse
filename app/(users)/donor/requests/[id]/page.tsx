import { Suspense } from 'react';
import RequestDetailClient from './request-details-form';
import GenericFallback from '@/components/fallback';

export default async function RequestPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return (
    <Suspense fallback={<GenericFallback />}>
      <RequestDetailClient id={id} />
    </Suspense>
  );
}
