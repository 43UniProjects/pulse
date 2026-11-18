import { Metadata } from 'next';
import { validateRoleAccess } from '@/lib/auth/guard';
import { connectToDatabase } from '@/lib/db/connect';
import { DonationRequest } from '@/lib/models/donation-request.model';
import { Donation } from '@/lib/models/donation.model';
import HospitalTrackingClient, {
  TrackingRequestItem,
  RespondingDonorItem,
} from './tracking-client';

export const dynamic = 'force-dynamic';
export const instant = false;

export const metadata: Metadata = {
  title: 'Emergency Tracking | Pulse',
  description:
    'Monitor active blood requests and incoming donors in real-time.',
};

export default async function HospitalTrackingPage() {
  const session = await validateRoleAccess('hospital');
  await connectToDatabase();

  const requestsRaw = await DonationRequest.find({
    hospitalId: session.user.id,
  })
    .sort({ createdAt: -1 })
    .lean();

  const requestIds = requestsRaw.map((r) => r._id);

  interface PopulatedDonation {
    _id: unknown;
    requestId: unknown;
    donorId?: {
      _id: unknown;
      fullName?: string;
      phone?: string;
      bloodGroup?: string;
    } | null;
    status: string;
  }

  const donationsRaw = (await Donation.find({
    requestId: { $in: requestIds },
  })
    .populate('donorId', 'fullName phone bloodGroup')
    .lean()) as unknown as PopulatedDonation[];

  const donationsByRequest: Record<string, RespondingDonorItem[]> = {};

  donationsRaw.forEach((d) => {
    const reqIdStr = d.requestId ? String(d.requestId) : '';
    if (!donationsByRequest[reqIdStr]) {
      donationsByRequest[reqIdStr] = [];
    }

    const donor = d.donorId;
    donationsByRequest[reqIdStr].push({
      _id: String(d._id),
      name: donor?.fullName || 'Anonymous Donor',
      phone: donor?.phone || 'Contact pending',
      bloodGroup: donor?.bloodGroup || 'O+',
      etaMins: 15,
      status: (d.status as RespondingDonorItem['status']) || 'pending',
    });
  });

  const trackingRequests: TrackingRequestItem[] = requestsRaw.map((req) => {
    const reqIdStr = req._id.toString();
    const responses = donationsByRequest[reqIdStr] || [];
    const fulfilled = responses.filter((r) => r.status === 'completed').length;

    return {
      _id: reqIdStr,
      requestId: req.requestId,
      bloodGroup: req.bloodGroup,
      urgency: req.urgency,
      requiredUnits: req.quantity,
      fulfilledUnits: fulfilled,
      createdAt: req.createdAt
        ? new Date(req.createdAt).toISOString()
        : new Date().toISOString(),
      donationResponses: responses,
    };
  });

  return <HospitalTrackingClient initialRequests={trackingRequests} />;
}
