import { Suspense } from 'react';
import RequestTrackingClient from './request-tracking';
import GenericFallback from '@/components/fallback';

export default async function RequestTracking({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return (
    <Suspense fallback={<GenericFallback />}>
      <RequestTrackingClient id={id} />
    </Suspense>
  );
}
