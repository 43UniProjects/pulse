import { Metadata } from 'next';
import Link from 'next/link';
import { Suspense } from 'react';
import { AlertTriangle } from 'lucide-react';
import { validateRoleAccess } from '@/lib/auth/guard';
import { connectToDatabase } from '@/lib/db/connect';
import { DonationRequest } from '@/lib/models/donation-request.model';
import { Donation } from '@/lib/models/donation.model';
import { Hospital } from '@/lib/models/hospital.model';
import { DonationRequestEntity } from '@/types/donor-request.type';

export const metadata: Metadata = { title: 'Hospital Dashboard | Pulse' };

const statusStyles: Record<string, string> = {
  pending:
    'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
  accepted: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  in_transit:
    'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
  completed:
    'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  declined: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
  expired: 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400',
};

function HospitalDashboardSkeleton() {
  return (
    <div className="p-8 max-w-7xl mx-auto w-full space-y-8 animate-pulse">
      <div className="h-20 bg-muted/40 rounded-xl" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-28 bg-muted/40 rounded-xl" />
        ))}
      </div>
      <div className="h-64 bg-muted/40 rounded-xl" />
    </div>
  );
}

async function HospitalDashboardContent() {
  const session = await validateRoleAccess('hospital');
  await connectToDatabase();

  const [hospital, requestsRaw] = await Promise.all([
    Hospital.findById(session.user.id).select('verificationStatus').lean(),
    DonationRequest.find({
      hospitalId: session.user.id,
    })
      .sort({ createdAt: -1 })
      .lean(),
  ]);

  const isVerified = hospital?.verificationStatus === 'verified';
  const verificationStatus = hospital?.verificationStatus || 'pending';

  const requestIds = requestsRaw.map((r) => r._id);

  const responseAgg = await Donation.aggregate([
    {
      $match: {
        requestId: { $in: requestIds },
        status: { $ne: 'declined' },
      },
    },
    {
      $group: {
        _id: '$requestId',
        count: { $sum: 1 },
      },
    },
  ]);

  const responseMap: Record<string, number> = {};
  responseAgg.forEach((item) => {
    responseMap[item._id.toString()] = item.count;
  });

  const requests: (DonationRequestEntity & { responseCount: number })[] =
    requestsRaw.map((r) => ({
      ...r,
      _id: r._id.toString(),
      hospitalId: r.hospitalId.toString(),
      createdAt: r.createdAt
        ? new Date(r.createdAt).toISOString()
        : new Date().toISOString(),
      updatedAt: r.updatedAt
        ? new Date(r.updatedAt).toISOString()
        : new Date().toISOString(),
      responseCount: responseMap[r._id.toString()] || 0,
    })) as unknown as (DonationRequestEntity & { responseCount: number })[];

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="font-display font-bold text-2xl text-foreground mb-1">
            Hospital Dashboard
          </h1>
          <p className="text-sm text-muted-foreground">
            Emergency Blood Request Coordination
          </p>
        </div>
        <Link
          href="/hospital/post-request"
          className="bg-primary text-primary-foreground font-medium text-sm px-4 py-2 rounded-md hover:bg-primary/90 transition-colors shadow-sm hover:shadow-md"
        >
          + Post New Request
        </Link>
      </div>

      {!isVerified && (
        <div className="mb-6 bg-amber-500/10 border border-amber-500/30 rounded-xl p-4 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h3 className="text-sm font-semibold text-amber-600 dark:text-amber-400">
              Facility Verification Pending
            </h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Your facility account is currently{' '}
              <span className="font-semibold text-foreground uppercase">
                {verificationStatus}
              </span>
              . An administrator must verify and approve your facility account
              before you can broadcast emergency blood requests or manage donor
              eligibility.
            </p>
          </div>
        </div>
      )}

      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <div className="px-5 py-3 border-b border-border">
          <h2 className="font-display font-semibold text-sm text-muted-foreground uppercase tracking-wider">
            All Blood Requests
          </h2>
        </div>

        {requests.length === 0 ? (
          <div className="p-12 text-center text-muted-foreground">
            <p className="text-sm mb-4">No blood requests posted yet.</p>
            <Link
              href="/hospital/post-request"
              className="inline-block bg-primary text-primary-foreground text-xs font-semibold px-4 py-2 rounded-md hover:bg-primary/90 transition-colors"
            >
              Post your first emergency request
            </Link>
          </div>
        ) : (
          <>
            {/* DESKTOP TABLE VIEW */}
            <div className="overflow-x-auto hidden md:block">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-left bg-secondary/30">
                    <th className="px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Blood Group
                    </th>
                    <th className="px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Quantity
                    </th>
                    <th className="px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Radius
                    </th>
                    <th className="px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Date Posted
                    </th>
                    <th className="px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Responses
                    </th>
                    <th className="px-5 py-3"></th>
                  </tr>
                </thead>
                <tbody>
                  {requests.map((r, i) => (
                    <tr
                      key={r._id}
                      className={`border-b border-border hover:bg-secondary/30 transition-colors ${
                        i === requests.length - 1 ? 'border-0' : ''
                      }`}
                    >
                      <td className="px-5 py-3.5">
                        <span className="font-semibold text-foreground">
                          {r.bloodGroup}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-muted-foreground font-tabular">
                        {r.quantity} Unit{r.quantity !== 1 ? 's' : ''}
                      </td>
                      <td className="px-5 py-3.5 text-muted-foreground font-tabular">
                        {r.radiusKm} km
                      </td>
                      <td className="px-5 py-3.5">
                        <span
                          className={`text-xs font-medium px-2.5 py-1 rounded-sm capitalize ${statusStyles[r.status] || ''}`}
                        >
                          {r.status}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-muted-foreground font-tabular">
                        {new Intl.DateTimeFormat('en-GB', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                        }).format(new Date(r.createdAt))}
                      </td>
                      <td className="px-5 py-3.5 text-muted-foreground font-tabular">
                        <span
                          className={
                            r.responseCount > 0
                              ? 'text-primary font-medium'
                              : ''
                          }
                        >
                          {r.responseCount}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <Link
                          href={`/hospital/tracking/${r._id}`}
                          className="text-xs font-medium bg-secondary text-secondary-foreground border border-border px-3 py-1.5 rounded-md hover:bg-secondary/80 transition-all hover:shadow-md active:scale-[0.98] inline-block"
                        >
                          Track
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* MOBILE CARD VIEW */}
            <div className="block md:hidden">
              <div className="flex flex-col divide-y divide-border">
                {requests.map((r) => (
                  <div
                    key={r._id}
                    className="p-4 flex flex-col gap-3 hover:bg-secondary/20 transition-colors"
                  >
                    <div className="flex justify-between items-start gap-2">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-foreground text-lg">
                          {r.bloodGroup}
                        </span>
                        <span className="text-xs font-medium text-muted-foreground bg-secondary px-2 py-1 rounded-md font-tabular">
                          {r.quantity} Unit{r.quantity !== 1 ? 's' : ''}
                        </span>
                      </div>
                      <span
                        className={`shrink-0 text-xs font-medium px-2.5 py-1 rounded-sm capitalize ${statusStyles[r.status] || ''}`}
                      >
                        {r.status}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-sm mt-1">
                      <div className="text-muted-foreground">Radius:</div>
                      <div className="text-foreground font-tabular">
                        {r.radiusKm} km
                      </div>

                      <div className="text-muted-foreground">Date Posted:</div>
                      <div className="text-foreground font-tabular">
                        {new Intl.DateTimeFormat('en-GB', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                        }).format(new Date(r.createdAt))}
                      </div>

                      <div className="text-muted-foreground">Responses:</div>
                      <div
                        className={`text-foreground font-medium font-tabular ${r.responseCount > 0 ? 'text-primary' : ''}`}
                      >
                        {r.responseCount}
                      </div>
                    </div>

                    <div className="pt-3 mt-1 border-t border-border/50 flex justify-end">
                      <Link
                        href={`/hospital/tracking/${r._id}`}
                        className="text-xs font-medium bg-primary text-primary-foreground px-4 py-2 w-full text-center rounded-md hover:bg-primary/90 transition-colors shadow-sm"
                      >
                        Track Request
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default function HospitalDashboard() {
  return (
    <Suspense fallback={<HospitalDashboardSkeleton />}>
      <HospitalDashboardContent />
    </Suspense>
  );
}
