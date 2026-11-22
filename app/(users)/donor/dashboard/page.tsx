import { Metadata } from 'next';
import Link from 'next/link';
import { Suspense } from 'react';
import {
  ShieldCheck,
  MessageSquare,
  Clock,
  MapPin,
  ChevronRight,
  Activity,
  AlertCircle,
  Droplet,
  Navigation,
} from 'lucide-react';
import { validateRoleAccess } from '@/lib/auth/guard';
import { connectToDatabase } from '@/lib/db/connect';
import { Donor } from '@/lib/models/donor.model';
import { Donation } from '@/lib/models/donation.model';
import {
  DonationRequest,
  type IDonationRequestDocument,
} from '@/lib/models/donation-request.model';
import { PushSubscription } from '@/lib/models/push-subscription.model';
import {
  buildNearbyRequestsNearSphereQuery,
  DEFAULT_COLOMBO_COORDS,
  ensureGeoIndexOnce,
  evaluateDonorDashboardEligibility,
  mergeAndSortNearbyRequests,
  normalizeGeoCoordinates,
} from '@/lib/matching/blood-compatibility';
import PushSubscriptionToggle from '@/components/notifications/push-subscription-toggle';
import { calculateClinicalEligibility } from '@/app/(users)/donor/requests/data';
import {
  DonationRequestEntity,
  REQUEST_URGENCY_LEVEL,
  RequestStatus,
} from '@/types/donor-request.type';

type LeanDonationRequest = Pick<
  IDonationRequestDocument,
  | '_id'
  | 'requestId'
  | 'hospitalId'
  | 'hospitalName'
  | 'address'
  | 'location'
  | 'bloodGroup'
  | 'quantity'
  | 'urgency'
  | 'status'
  | 'radiusKm'
  | 'notes'
  | 'matchedDonorsCount'
  | 'notifiedDonors'
  | 'fulfilledBy'
  | 'createdAt'
  | 'updatedAt'
>;

export const metadata: Metadata = {
  title: 'Donor Dashboard',
  description: 'View your donation status and nearby emergency requests.',
};

function DashboardSkeleton() {
  return (
    <div className="p-6 md:p-8 max-w-5xl mx-auto w-full space-y-6 animate-pulse">
      <div className="bg-card border border-border rounded-xl p-5 md:p-6 shadow-sm flex items-center justify-between">
        <div className="space-y-2">
          <div className="h-7 w-48 bg-muted rounded" />
          <div className="h-4 w-32 bg-muted rounded" />
        </div>
        <div className="w-12 h-12 rounded-xl bg-muted" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="space-y-6 lg:col-span-1">
          <div className="bg-card border border-border rounded-xl p-5 h-28 bg-muted/40" />
          <div className="bg-card border border-border rounded-xl p-5 h-28 bg-muted/40" />
          <div className="bg-card border border-border rounded-xl p-5 h-44 bg-muted/40" />
        </div>
        <div className="lg:col-span-2 space-y-3">
          <div className="h-5 w-48 bg-muted rounded" />
          <div className="bg-card border border-border rounded-xl p-5 h-24 bg-muted/40" />
          <div className="bg-card border border-border rounded-xl p-5 h-24 bg-muted/40" />
        </div>
      </div>
    </div>
  );
}

async function DonorDashboardContent() {
  const session = await validateRoleAccess('donor');
  await connectToDatabase();

  let donor = await Donor.findById(session.user.id).lean();

  if (!donor) {
    const created = await Donor.create({
      _id: session.user.id,
      fullName: session.user.name || '',
      email: session.user.email,
      phone: '',
      bloodGroup: '',
      dateOfBirth: null,
      address: '',
      location: { type: 'Point', coordinates: DEFAULT_COLOMBO_COORDS },
      radiusPreferenceKm: 10,
      isEligible: true,
      isAvailable: true,
      liveLocationSync: false,
      smsAlertsEnabled: true,
      emailAlertsEnabled: false,
    });
    donor = created.toObject();
  }

  // Calculate clinical eligibility (120 days waiting period)
  const isClinicallyEligible = calculateClinicalEligibility(donor);

  const donorCoordinates = normalizeGeoCoordinates(donor.location?.coordinates);
  const donorRadiusKm =
    typeof donor.radiusPreferenceKm === 'number' && donor.radiusPreferenceKm > 0
      ? donor.radiusPreferenceKm
      : 10;

  const dashboardEligibility = evaluateDonorDashboardEligibility(donor);
  const canRespondToRequests =
    dashboardEligibility.eligible && Boolean(donor.bloodGroup);

  // Ensure DonationRequest 2dsphere index exists on cold databases (e.g. fresh Docker volumes)
  if (canRespondToRequests) {
    await ensureGeoIndexOnce('DonationRequest', () =>
      DonationRequest.createIndexes(),
    );
  }

  // Runtime read of VAPID public key keeps Docker builds functional without .env.local in build context
  const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || '';

  const [
    nearbyRequestsRaw,
    notifiedRequestsRaw,
    pushSubscriptionExists,
    userDonationsRaw,
  ] = await Promise.all([
    canRespondToRequests && donor.bloodGroup
      ? (DonationRequest.find(
          buildNearbyRequestsNearSphereQuery({
            donorBloodGroup: donor.bloodGroup,
            donorCoordinates,
            radiusKm: donorRadiusKm,
          }),
        )
          .limit(10)
          .lean() as Promise<LeanDonationRequest[]>)
      : Promise.resolve<LeanDonationRequest[]>([]),
    canRespondToRequests
      ? (DonationRequest.find({
          status: 'pending',
          notifiedDonors: donor._id,
        })
          .sort({ createdAt: -1 })
          .limit(10)
          .lean() as Promise<LeanDonationRequest[]>)
      : Promise.resolve<LeanDonationRequest[]>([]),
    PushSubscription.exists({ donorId: donor._id }),
    Donation.find({ donorId: session.user.id })
      .select('requestId status')
      .lean(),
  ]);

  const donationByRequestId = new Map<string, string>();
  const excludedRequestIds = new Set<string>();

  for (const d of userDonationsRaw) {
    if (d.requestId) {
      const reqIdStr = String(d.requestId);
      donationByRequestId.set(reqIdStr, d.status || '');
      if (d.status === 'declined' || d.status === 'completed') {
        excludedRequestIds.add(reqIdStr);
      }
    }
  }

  // Also include any active request this donor has accepted
  const acceptedCommitmentIds = Array.from(donationByRequestId.entries())
    .filter(([, status]) => status === 'accepted')
    .map(([id]) => id);

  const acceptedRequestsRaw =
    acceptedCommitmentIds.length > 0
      ? ((await DonationRequest.find({
          _id: { $in: acceptedCommitmentIds },
          status: { $nin: ['completed', 'declined'] },
        }).lean()) as LeanDonationRequest[])
      : [];

  // Deduplicate nearby $nearSphere matches, explicitly notified pending requests, and accepted commitments
  const sortedMatchedRequests = mergeAndSortNearbyRequests(
    [...nearbyRequestsRaw, ...acceptedRequestsRaw],
    notifiedRequestsRaw,
    donorCoordinates,
    10,
  );

  // Filter out requests this donor already declined or completed, or created before donor registration
  const donorCreatedAtTime = donor.createdAt
    ? new Date(donor.createdAt).getTime()
    : 0;

  const filteredMatchedRequests = sortedMatchedRequests.filter(({ req }) => {
    const reqIdStr = req._id.toString();
    if (excludedRequestIds.has(reqIdStr)) return false;

    const isAcceptedByDonor = donationByRequestId.get(reqIdStr) === 'accepted';
    if (!isAcceptedByDonor && donorCreatedAtTime > 0 && req.createdAt) {
      const reqCreatedTime = new Date(req.createdAt).getTime();
      if (reqCreatedTime < donorCreatedAtTime) return false;
    }
    return true;
  });

  const activeRequests: DonationRequestEntity[] = filteredMatchedRequests.map(
    ({ req, distanceKm }) => {
      const reqIdStr = req._id.toString();
      const donorResponse = donationByRequestId.get(reqIdStr);
      return {
        _id: reqIdStr,
        requestId: req.requestId,
        hospitalId: req.hospitalId.toString(),
        hospitalName: req.hospitalName,
        address: req.address,
        location: {
          type: 'Point',
          coordinates: normalizeGeoCoordinates(req.location?.coordinates),
        },
        bloodGroup: req.bloodGroup,
        quantity: req.quantity,
        urgency: req.urgency,
        status: (donorResponse === 'accepted'
          ? 'accepted'
          : req.status) as RequestStatus,
        radiusKm: req.radiusKm,
        distance: `${distanceKm.toFixed(1)} km`,
        notes: req.notes || '',
        matchedDonorsCount: req.matchedDonorsCount ?? 0,
        notifiedDonors: Array.isArray(req.notifiedDonors)
          ? req.notifiedDonors.map((donorId) => donorId.toString())
          : [],
        fulfilledBy: req.fulfilledBy ? req.fulfilledBy.toString() : undefined,
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
      };
    },
  );

  const hasPushSubscription = Boolean(pushSubscriptionExists);

  return (
    <div className="p-6 md:p-8 max-w-5xl mx-auto w-full space-y-6">
      {/* Welcome Banner */}
      <div className="bg-card border border-border rounded-xl p-5 md:p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <h1 className="font-semibold text-2xl tracking-tight text-foreground">
              Dashboard
            </h1>
            {donor.isEligible ? (
              <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 inline-flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" /> Verified Donor
              </span>
            ) : (
              <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/20 inline-flex items-center gap-1">
                <Clock className="w-3 h-3" /> Verification Pending
              </span>
            )}
          </div>
          <p className="text-sm text-muted-foreground">
            Welcome back,{' '}
            {donor.fullName ? donor.fullName.split(' ')[0] : 'Donor'}
          </p>
        </div>

        {/* Quick Identity Snippet */}
        <div className="hidden md:flex shrink-0 w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 items-center justify-center text-primary">
          <span className="font-bold text-lg">{donor.bloodGroup}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Status & Alerts */}
        <div className="space-y-6 lg:col-span-1">
          {/* SMS alerts banner */}
          <div className="bg-card border border-border rounded-xl p-5 shadow-sm flex items-start gap-4">
            <div className="p-2 bg-primary/10 rounded-lg text-primary shrink-0 mt-0.5">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <div className="text-sm font-semibold text-foreground mb-1">
                {donor.smsAlertsEnabled
                  ? 'SMS alerts are on'
                  : 'SMS alerts are off'}
              </div>
              <div className="text-xs text-muted-foreground leading-relaxed">
                We will text you the moment{' '}
                <strong className="text-foreground">{donor.bloodGroup}</strong>{' '}
                blood is needed within a{' '}
                <span className="font-tabular">{donorRadiusKm}</span>km radius
                of {donor.address}.
              </div>
            </div>
          </div>

          {/* Browser Push Notifications Toggle */}
          <PushSubscriptionToggle
            vapidPublicKey={vapidPublicKey}
            initialSubscribed={hasPushSubscription}
          />

          {/* Eligibility Card */}
          <div className="bg-card border border-border rounded-xl p-5 shadow-sm relative overflow-hidden">
            {/* Green accent line */}
            <div
              className={`absolute top-0 left-0 right-0 h-1.5 ${
                isClinicallyEligible ? 'bg-emerald-500' : 'bg-amber-500'
              }`}
            />

            <h3 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-4 mt-1">
              Clinical Eligibility
            </h3>

            <div className="flex items-center gap-3 mb-4">
              <div
                className={`p-2 rounded-full ${
                  isClinicallyEligible
                    ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
                    : 'bg-amber-500/15 text-amber-600 dark:text-amber-400'
                }`}
              >
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <p className="text-lg font-semibold text-foreground">
                  {isClinicallyEligible
                    ? 'Eligible to Donate'
                    : 'Waiting Period Active'}
                </p>
                <p
                  className={`text-xs font-medium ${
                    isClinicallyEligible
                      ? 'text-emerald-600 dark:text-emerald-400'
                      : 'text-amber-600 dark:text-amber-400'
                  }`}
                >
                  {isClinicallyEligible
                    ? 'Clearance active'
                    : '4-month interval required'}
                </p>
              </div>
            </div>

            <p className="text-xs text-muted-foreground flex items-start gap-2 pt-4 border-t border-border">
              <Clock className="w-4 h-4 shrink-0" />
              <span className="font-tabular">
                Your last donation was on{' '}
                {donor.lastDonationDate
                  ? new Intl.DateTimeFormat('en-GB', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric',
                    }).format(new Date(donor.lastDonationDate))
                  : 'Never'}
                .
              </span>
            </p>
          </div>
        </div>

        {/* Right Column: Nearby Requests */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">
              Nearby Active Emergencies
            </h2>
            <Link
              href="/donor/requests"
              className="text-xs font-medium text-primary hover:underline underline-offset-4"
            >
              View All
            </Link>
          </div>

          <div className="flex flex-col gap-3">
            {dashboardEligibility.reason === 'missing_blood_group' ? (
              <div className="bg-card border border-border rounded-xl p-8 text-center text-muted-foreground shadow-sm space-y-3">
                <p className="text-sm">
                  Set your blood group in your profile to see nearby compatible
                  emergency requests.
                </p>
                <Link
                  href="/donor/profile"
                  className="inline-block text-xs font-medium text-primary hover:underline underline-offset-4"
                >
                  Complete Donor Profile
                </Link>
              </div>
            ) : dashboardEligibility.reason === 'cooldown' ? (
              <div className="bg-card border border-amber-500/30 rounded-xl p-8 text-center text-muted-foreground shadow-sm space-y-2">
                <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-amber-500/15 text-amber-600 dark:text-amber-400 mx-auto mb-1">
                  <Clock className="w-5 h-5" />
                </div>
                <p className="text-sm font-medium text-foreground">
                  Emergency Requests Paused During Waiting Period
                </p>
                <p className="text-xs text-muted-foreground max-w-md mx-auto leading-relaxed">
                  For your clinical safety, you cannot respond to blood requests
                  during the mandatory 120-day post-donation recovery interval.
                  {dashboardEligibility.nextEligibleDate && (
                    <>
                      {' '}
                      You will be eligible to donate again on{' '}
                      <strong className="text-foreground font-tabular">
                        {new Intl.DateTimeFormat('en-GB', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                        }).format(dashboardEligibility.nextEligibleDate)}
                      </strong>
                      .
                    </>
                  )}
                </p>
              </div>
            ) : dashboardEligibility.reason === 'ineligible' ? (
              <div className="bg-card border border-amber-500/30 rounded-xl p-8 text-center text-muted-foreground shadow-sm space-y-2">
                <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-amber-500/15 text-amber-600 dark:text-amber-400 mx-auto mb-1">
                  <AlertCircle className="w-5 h-5" />
                </div>
                <p className="text-sm font-medium text-foreground">
                  Account Currently Marked Clinically Ineligible
                </p>
                <p className="text-xs text-muted-foreground max-w-md mx-auto leading-relaxed">
                  Nearby emergency requests are paused until your clinical
                  eligibility clearance is restored.
                </p>
              </div>
            ) : dashboardEligibility.reason === 'unavailable' ? (
              <div className="bg-card border border-border rounded-xl p-8 text-center text-muted-foreground shadow-sm space-y-3">
                <p className="text-sm font-medium text-foreground">
                  Availability Currently Paused
                </p>
                <p className="text-xs text-muted-foreground max-w-md mx-auto leading-relaxed">
                  You are currently marked unavailable to donate. Turn
                  availability back on in your profile to view and respond to
                  nearby emergency requests.
                </p>
                <Link
                  href="/donor/profile"
                  className="inline-block text-xs font-medium text-primary hover:underline underline-offset-4"
                >
                  Update Availability in Profile
                </Link>
              </div>
            ) : activeRequests.length === 0 ? (
              <div className="bg-card border border-border rounded-xl p-8 text-center text-muted-foreground shadow-sm">
                No compatible active emergencies within{' '}
                <span className="font-tabular">{donorRadiusKm} km</span> right
                now.
              </div>
            ) : (
              activeRequests.map((request: DonationRequestEntity) => (
                <Link
                  key={request._id}
                  href={`/donor/requests/${request._id}`}
                  className="group block bg-card border border-border rounded-xl p-4 md:p-5 hover:border-primary/50 hover:shadow-sm transition-all relative overflow-hidden"
                >
                  {/* Red accent bar for critical requests */}
                  {request.urgency === REQUEST_URGENCY_LEVEL[0] && (
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-red-600" />
                  )}

                  <div className="flex items-center justify-between gap-4">
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-2 mb-1">
                        <UrgencyBadge level={request.urgency} />
                        <span className="text-xs font-mono text-muted-foreground uppercase tracking-wider hidden sm:inline-block">
                          {request.requestId || request._id}
                        </span>
                      </div>
                      <h3 className="font-medium text-foreground text-base group-hover:text-primary transition-colors">
                        {request.hospitalName}
                      </h3>
                      <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1 bg-secondary px-2 py-0.5 rounded text-foreground font-medium">
                          <Droplet className="w-3 h-3 text-primary" />{' '}
                          {request.bloodGroup}
                        </span>
                        {request.distance && (
                          <span className="flex items-center gap-1 text-foreground font-medium font-tabular">
                            <Navigation className="w-3 h-3 text-primary" />{' '}
                            {request.distance}
                          </span>
                        )}
                        <span className="flex items-center gap-1 hidden sm:flex">
                          <MapPin className="w-3 h-3" />{' '}
                          {request.address || 'Nearby'}
                        </span>
                        <span className="flex items-center gap-1 font-tabular">
                          <Clock className="w-3 h-3" /> {request.timePosted}
                        </span>
                      </div>
                    </div>

                    <div className="shrink-0 flex flex-col items-end gap-1">
                      {request.status === 'accepted' ? (
                        <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-md bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                          Accepted — En Route
                        </span>
                      ) : (
                        <div className="hidden sm:flex items-center text-xs font-medium text-muted-foreground group-hover:text-primary transition-colors">
                          Respond
                          <ChevronRight className="w-4 h-4 ml-1" />
                        </div>
                      )}
                      {/* Mobile arrow */}
                      <ChevronRight className="w-5 h-5 text-muted-foreground sm:hidden" />
                    </div>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function DonorDashboard() {
  return (
    <Suspense fallback={<DashboardSkeleton />}>
      <DonorDashboardContent />
    </Suspense>
  );
}

// --- Helper Component ---

function UrgencyBadge({ level }: { level?: string }) {
  if (level === REQUEST_URGENCY_LEVEL[0]) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 text-[10px] font-bold uppercase tracking-widest border border-red-200 dark:border-red-900/50">
        <AlertCircle className="w-3 h-3" /> Critical
      </span>
    );
  }
  if (level === REQUEST_URGENCY_LEVEL[1]) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 text-[10px] font-bold uppercase tracking-widest border border-orange-200 dark:border-orange-900/50">
        <Activity className="w-3 h-3" /> High
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-[10px] font-bold uppercase tracking-widest border border-blue-200 dark:border-blue-900/50">
      <Droplet className="w-3 h-3" /> Routine
    </span>
  );
}
