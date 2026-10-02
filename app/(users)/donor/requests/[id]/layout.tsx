import RequestDetailClient from './request-details-form';

export default async function RequestDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <div className="w-full">
      <RequestDetailClient id={id} />
    </div>
  );
}
