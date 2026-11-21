import { Suspense } from 'react';
import mongoose from 'mongoose';
import RequestTrackingClient, {
  TrackingDetailDonor,
  TrackingDetailRequest,
} from '@/app/(users)/hospital/tracking/[id]/request-tracking';
import GenericFallback from '@/components/fallback';
import { validateRoleAccess } from '@/lib/auth/guard';
import { connectToDatabase } from '@/lib/db/connect';
import { DonationRequest } from '@/lib/models/donation-request.model';
import { Donation } from '@/lib/models/donation.model';
import '@/lib/models/donor.model';
import '@/lib/models/hospital.model';

function calculateHaversineDistanceKm(
  coords1: [number, number], // [lng, lat]
  coords2: [number, number], // [lng, lat]
): number {
  const [lon1, lat1] = coords1;
  const [lon2, lat2] = coords2;

  const R = 6371; // Earth's radius in km
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

async function RequestTrackingContent({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  await validateRoleAccess('hospital');
  await connectToDatabase();

  const query = mongoose.Types.ObjectId.isValid(id)
    ? { $or: [{ _id: new mongoose.Types.ObjectId(id) }, { requestId: id }] }
    : { requestId: id };

  const request = await DonationRequest.findOne(query).lean();

  if (!request) {
    return (
      <div className="p-8 max-w-5xl mx-auto text-center text-muted-foreground">
        Emergency blood request record not found.
      </div>
    );
  }

  interface PopulatedDonation {
    _id: unknown;
    donationId?: string;
    donorId?: {
      _id: unknown;
      fullName?: string;
      phone?: string;
      bloodGroup?: string;
      isEligible?: boolean;
      location?: { coordinates?: [number, number] };
    } | null;
    bloodGroup: string;
    units: number;
    status: string;
    batchNumber?: string;
    donationDate?: Date | string;
    createdAt?: Date | string;
  }

  const donationsRaw = (await Donation.find({ requestId: request._id })
    .populate('donorId', 'fullName phone bloodGroup isEligible location')
    .sort({ createdAt: -1 })
    .lean()) as unknown as PopulatedDonation[];

  const hospitalCoords = request.location?.coordinates;

  const serializedRequest: TrackingDetailRequest = {
    _id: request._id.toString(),
    requestId: request.requestId,
    bloodGroup: request.bloodGroup,
    quantity: request.quantity,
    radiusKm: request.radiusKm,
    urgency: request.urgency,
    status: request.status,
  };

  const serializedDonors: TrackingDetailDonor[] = donationsRaw.map((d) => {
    let computedDistance = 'Nearby';
    const donorCoords = d.donorId?.location?.coordinates;

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

    const mappedStatus =
      d.status === 'accepted'
        ? 'Accepted'
        : d.status === 'completed'
          ? 'Completed'
          : d.status === 'declined'
            ? 'Declined'
            : 'Pending';

    return {
      donationId: d._id ? String(d._id) : d.donationId || '',
      donorId: d.donorId?._id ? String(d.donorId._id) : '',
      name: d.donorId?.fullName || 'Responding Donor',
      bloodGroup: d.donorId?.bloodGroup || d.bloodGroup || request.bloodGroup,
      distance: computedDistance,
      status: mappedStatus,
      phone: d.donorId?.phone || 'Pending',
      verified: Boolean(d.donorId?.isEligible),
      units: d.units || 1,
      batchNumber: d.batchNumber || '',
    };
  });

  return (
    <RequestTrackingClient
      id={id}
      requestData={serializedRequest}
      initialDonors={serializedDonors}
    />
  );
}

export default function RequestTracking({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return (
    <Suspense fallback={<GenericFallback />}>
      <RequestTrackingContent params={params} />
    </Suspense>
  );
}
