import RequestTrackingClient from './request-tracking-client';

export default async function RequestTracking({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <RequestTrackingClient id={id} />;
}
