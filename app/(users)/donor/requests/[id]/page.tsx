import RequestDetailClient from './request-details-form';

export default async function RequestPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <RequestDetailClient id={id} />;
}
