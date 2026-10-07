import { Suspense } from 'react';
import RequestDetailClient from './request-details-form';
import GenericFallback from '@/components/fallback';

export default function RequestPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return (
    <Suspense fallback={<GenericFallback />}>
      <RequestDetailClient paramsPromise={params} />
    </Suspense>
  );
}
