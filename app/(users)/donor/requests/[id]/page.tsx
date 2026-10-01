import RequestDetailClient from './request-details-client';

export default async function RequestPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <RequestDetailClient id={id} />;
}
