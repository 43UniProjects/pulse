import { Suspense } from 'react';
import mongoose from 'mongoose';
import RequestDetailClient, {
  SerializedRequestData,
} from './request-details-form';
import GenericFallback from '@/components/fallback';
import { validateRoleAccess } from '@/lib/auth/guard';
import { connectToDatabase } from '@/lib/db/connect';
import { DonationRequest } from '@/lib/models/donation-request.model';
import { Donation } from '@/lib/models/donation.model';
import { Donor } from '@/lib/models/donor.model';

function calculateHaversineDistanceKm(
  coords1: [number, number], // [lng, lat]
  coords2: [number, number], // [lng, lat]
): number {
  const [lon1, lat1] = coords1;
  const [lon2, lat2] = coords2;

  const R = 6371; // Earth's radius in kilometers
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

async function RequestPageContent({ id }: { id: string }) {
  const session = await validateRoleAccess('donor');
  await connectToDatabase();

  const query = mongoose.Types.ObjectId.isValid(id)
    ? {
        $or: [{ _id: new mongoose.Types.ObjectId(id) }, { requestId: id }],
      }
    : { requestId: id };

  const rawReq = await DonationRequest.findOne(query)
    .populate('hospitalId', 'name address hotline location')
    .lean();

  if (!rawReq) {
    return (
      <div className="p-8 max-w-4xl mx-auto font-sans text-center text-muted-foreground">
        Emergency blood request not found or has expired.
      </div>
    );
  }

  // 1. Fetch current donor's geospatial coordinates
  const donor = await Donor.findById(session.user.id)
    .select('location isAvailable isEligible')
    .lean();

  // 2. Fetch existing response status for this specific donor
  const userDonation = await Donation.findOne({
    requestId: rawReq._id,
    donorId: session.user.id,
  })
    .sort({ createdAt: -1 })
    .lean();

  const initialResponse = userDonation?.status || 'pending';

  // 3. Resolve hospital coordinates
  interface PopulatedHospital {
    _id?: unknown;
    name?: string;
    address?: string;
    hotline?: string;
    location?: { coordinates?: [number, number] };
  }

  const hospital = rawReq.hospitalId as unknown as PopulatedHospital | null;
  const hospitalCoords =
    hospital?.location?.coordinates || rawReq.location?.coordinates;

  let hospitalLat = 6.9271;
  let hospitalLng = 79.8612;

  if (hospitalCoords && hospitalCoords.length === 2) {
    hospitalLng = hospitalCoords[0];
    hospitalLat = hospitalCoords[1];
  }

  // 4. Calculate real-time Haversine proximity
  let computedDistance = 'Nearby';
  const donorCoords = donor?.location?.coordinates;
  if (
    donorCoords &&
    donorCoords.length === 2 &&
    hospitalCoords &&
    hospitalCoords.length === 2
  ) {
    const km = calculateHaversineDistanceKm(
      donorCoords as [number, number],
      hospitalCoords as [number, number],
    );
    computedDistance = `${km} km`;
  }

  // 5. Serialize request data cleanly for client component boundary
  const serializedRequest: SerializedRequestData = {
    _id: rawReq._id.toString(),
    requestId: rawReq.requestId,
    hospitalName: hospital?.name || rawReq.hospitalName || 'Hospital Facility',
    hospitalAddress: hospital?.address || rawReq.address,
    hospitalHotline: hospital?.hotline || '',
    hospitalCoords: {
      lat: hospitalLat,
      lng: hospitalLng,
    },
    bloodGroup: rawReq.bloodGroup,
    quantity: rawReq.quantity,
    urgency: rawReq.urgency,
    status: rawReq.status,
    radiusKm: rawReq.radiusKm,
    notes: rawReq.notes || '',
    distance: computedDistance,
    createdAt: rawReq.createdAt
      ? new Date(rawReq.createdAt).toISOString()
      : new Date().toISOString(),
  };

  return (
    <RequestDetailClient
      request={serializedRequest}
      initialResponseStatus={initialResponse}
    />
  );
}

export default async function RequestPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <Suspense fallback={<GenericFallback />}>
      <RequestPageContent id={id} />
    </Suspense>
  );
}
