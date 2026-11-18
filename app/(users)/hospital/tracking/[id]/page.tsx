import { Suspense } from 'react';
import mongoose from 'mongoose';
import RequestTrackingClient, {
  TrackingDetailDonor,
  TrackingDetailRequest,
} from './request-tracking';
import GenericFallback from '@/components/fallback';
import { connectToDatabase } from '@/lib/db/connect';
import { DonationRequest } from '@/lib/models/donation-request.model';
import { Donation } from '@/lib/models/donation.model';

export default async function RequestTracking({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  await connectToDatabase();

  const query = mongoose.Types.ObjectId.isValid(id)
    ? { $or: [{ _id: new mongoose.Types.ObjectId(id) }, { requestId: id }] }
    : { requestId: id };

  const request = await DonationRequest.findOne(query).lean();

  interface PopulatedDonation {
    _id: unknown;
    donorId?: {
      _id: unknown;
      fullName?: string;
      phone?: string;
      bloodGroup?: string;
      isEligible?: boolean;
    } | null;
    status: string;
  }

  let donationsRaw: PopulatedDonation[] = [];
  if (request) {
    donationsRaw = (await Donation.find({ requestId: request._id })
      .populate('donorId', 'fullName phone bloodGroup isEligible')
      .lean()) as unknown as PopulatedDonation[];
  }

  const serializedRequest: TrackingDetailRequest | null = request
    ? {
        _id: request._id.toString(),
        requestId: request.requestId,
        bloodGroup: request.bloodGroup,
        quantity: request.quantity,
        radiusKm: request.radiusKm,
        urgency: request.urgency,
        status: request.status,
      }
    : null;

  const serializedDonors: TrackingDetailDonor[] = donationsRaw.map((d) => ({
    name: d.donorId?.fullName || 'Responding Donor',
    distance: 'Nearby',
    status:
      d.status === 'accepted'
        ? 'Accepted'
        : d.status === 'declined'
          ? 'Declined'
          : 'Notified',
    phone: d.donorId?.phone || 'Pending',
    verified: Boolean(d.donorId?.isEligible),
  }));

  return (
    <Suspense fallback={<GenericFallback />}>
      <RequestTrackingClient
        id={id}
        requestData={serializedRequest}
        initialDonors={serializedDonors}
      />
    </Suspense>
  );
}
