import mongoose from 'mongoose';
import { connectToDatabase } from '@/lib/db/connect';
import { DonationRequest } from '@/lib/models/donation-request.model';
import { Donation } from '@/lib/models/donation.model';
import { Donor } from '@/lib/models/donor.model';
import '@/lib/models/hospital.model';
import {
  DonationRequestEntity,
  RequestStatus,
} from '@/types/donor-request.type';
import { DonationEntity } from '@/types/donation.type';
import { DonorEntity } from '@/types/donor.type';

/**
 * Retrieves a specific donation request by MongoDB ObjectId or requestId code.
 */
export async function getDonationRequest(
  id: string,
): Promise<DonationRequestEntity | null> {
  await connectToDatabase();
  const query = mongoose.Types.ObjectId.isValid(id)
    ? { $or: [{ _id: new mongoose.Types.ObjectId(id) }, { requestId: id }] }
    : { requestId: id };

  const req = await DonationRequest.findOne(query).lean();
  if (!req) return null;

  return {
    ...req,
    _id: req._id.toString(),
    hospitalId: req.hospitalId.toString(),
    createdAt: req.createdAt
      ? new Date(req.createdAt).toISOString()
      : new Date().toISOString(),
    updatedAt: req.updatedAt
      ? new Date(req.updatedAt).toISOString()
      : new Date().toISOString(),
  } as unknown as DonationRequestEntity;
}

/**
 * Calculates whether a donor is clinically eligible based on the 120-day rule.
 */
export function calculateClinicalEligibility(donor: {
  isEligible: boolean;
  lastDonationDate?: Date | null;
}): boolean {
  if (!donor.isEligible) return false;
  if (!donor.lastDonationDate) return true;
  const lastDonationTime = new Date(donor.lastDonationDate).getTime();
  const fourMonthsMs = 120 * 24 * 60 * 60 * 1000;
  return Date.now() - lastDonationTime >= fourMonthsMs;
}

/**
 * Retrieves a donor's profile from MongoDB.
 */
export async function getDonorProfile(
  donorId: string,
): Promise<DonorEntity | null> {
  await connectToDatabase();
  const donor = await Donor.findById(donorId).lean();
  if (!donor) return null;

  return {
    ...donor,
    _id: donor._id.toString(),
    dateOfBirth: donor.dateOfBirth ? new Date(donor.dateOfBirth) : null,
    lastDonationDate: donor.lastDonationDate
      ? new Date(donor.lastDonationDate)
      : null,
    createdAt: donor.createdAt ? new Date(donor.createdAt) : undefined,
    updatedAt: donor.updatedAt ? new Date(donor.updatedAt) : undefined,
  } as unknown as DonorEntity;
}

/**
 * Retrieves a donor's completed physical donation history.
 */
export async function getDonationHistory(
  donorId: string,
): Promise<DonationEntity[]> {
  await connectToDatabase();
  const donations = await Donation.find({
    donorId,
    status: 'completed',
  })
    .populate('hospitalId', 'name address')
    .sort({ donationDate: -1 })
    .lean();

  return donations.map((d) => {
    interface PopulatedHospital {
      name?: string;
      address?: string;
    }
    const hospital = d.hospitalId as unknown as PopulatedHospital | null;

    return {
      ...d,
      _id: d._id.toString(),
      donorId: d.donorId.toString(),
      hospitalId: hospital?.name || d.hospitalId.toString(),
      requestId: d.requestId ? d.requestId.toString() : null,
      donationDate: d.donationDate
        ? new Date(d.donationDate).toISOString()
        : new Date().toISOString(),
      createdAt: d.createdAt
        ? new Date(d.createdAt).toISOString()
        : new Date().toISOString(),
      updatedAt: d.updatedAt
        ? new Date(d.updatedAt).toISOString()
        : new Date().toISOString(),
    } as unknown as DonationEntity;
  });
}

/**
 * Retrieves active emergency blood requests available for the donor.
 * Excludes requests the donor has already declined or completed.
 * Badges requests the donor has currently accepted.
 */
export async function getDonationRequests(
  donorId?: string,
): Promise<DonationRequestEntity[]> {
  await connectToDatabase();

  let userDonations: { requestId?: unknown; status?: string }[] = [];
  if (donorId) {
    userDonations = (await Donation.find({ donorId })
      .select('requestId status')
      .lean()) as unknown as { requestId?: unknown; status?: string }[];
  }

  const donationByRequestId = new Map<string, string>();
  const excludedRequestIds: mongoose.Types.ObjectId[] = [];

  for (const d of userDonations) {
    if (d.requestId) {
      const reqIdStr = String(d.requestId);
      donationByRequestId.set(reqIdStr, d.status || '');

      // Exclude requests this donor has already declined or completed
      if (d.status === 'declined' || d.status === 'completed') {
        if (mongoose.Types.ObjectId.isValid(reqIdStr)) {
          excludedRequestIds.push(new mongoose.Types.ObjectId(reqIdStr));
        }
      }
    }
  }

  const query: Record<string, unknown> = {
    status: { $in: ['pending', 'in-progress', 'in_transit'] },
  };

  if (excludedRequestIds.length > 0) {
    query._id = { $nin: excludedRequestIds };
  }

  const requests = await DonationRequest.find(query)
    .sort({ createdAt: -1 })
    .lean();

  return requests.map((req) => {
    const reqIdStr = req._id.toString();
    const donorResponse = donationByRequestId.get(reqIdStr);

    return {
      ...req,
      _id: reqIdStr,
      hospitalId: req.hospitalId.toString(),
      // If donor accepted this request, show status as 'accepted'
      status: (donorResponse === 'accepted'
        ? 'accepted'
        : req.status) as RequestStatus,
      timePosted: req.createdAt
        ? new Intl.DateTimeFormat('en-GB', {
            hour: '2-digit',
            minute: '2-digit',
            day: '2-digit',
            month: 'short',
          }).format(new Date(req.createdAt))
        : 'Recent',
      createdAt: req.createdAt
        ? new Date(req.createdAt).toISOString()
        : new Date().toISOString(),
      updatedAt: req.updatedAt
        ? new Date(req.updatedAt).toISOString()
        : new Date().toISOString(),
    } as unknown as DonationRequestEntity;
  });
}
