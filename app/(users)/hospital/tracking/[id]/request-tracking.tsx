'use client';

export interface TrackingDetailDonor {
  name: string;
  distance: string;
  status: string;
  phone: string;
  verified: boolean;
}

export interface TrackingDetailRequest {
  _id: string;
  requestId?: string;
  bloodGroup: string;
  quantity: number;
  radiusKm: number;
  urgency: string;
  status: string;
}

const statusStyles: Record<string, string> = {
  Notified: 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400',
  Accepted:
    'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400',
  Declined: 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400',
};

export default function RequestTrackingClient({
  id,
  requestData,
  initialDonors = [],
}: {
  id: string;
  requestData?: TrackingDetailRequest | null;
  initialDonors?: TrackingDetailDonor[];
}) {
  const donors = initialDonors;
  const accepted = donors.filter((d) => d.status === 'Accepted').length;
  const needed = requestData?.quantity || 1;
  const pct = Math.round((accepted / needed) * 100);

  if (!requestData) {
    return (
      <div className="p-8 max-w-5xl mx-auto text-center text-muted-foreground">
        Request record not found.
      </div>
    );
  }

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="mb-6 glass rounded-xl border px-5 py-4 shadow-sm">
        <h1 className="font-display font-bold text-2xl text-foreground mb-1">
          Request Tracking
        </h1>
        <p className="text-sm text-muted-foreground">
          Request #{requestData.requestId || id} — {requestData.bloodGroup},{' '}
          {requestData.quantity} unit{requestData.quantity !== 1 ? 's' : ''},{' '}
          {requestData.radiusKm} km radius
        </p>
      </div>

      {/* Summary */}
      <div className="glass border rounded-xl p-5 shadow-sm mb-6 grid grid-cols-3 gap-5">
        <div>
          <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-0.5">
            Blood Group
          </div>
          <div className="font-display font-bold text-xl text-foreground font-tabular">
            {requestData.bloodGroup}
          </div>
        </div>
        <div>
          <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-0.5">
            Quantity Needed
          </div>
          <div className="font-display font-bold text-xl text-foreground font-tabular">
            {requestData.quantity} unit
            {requestData.quantity !== 1 ? 's' : ''}
          </div>
        </div>
        <div>
          <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-0.5">
            Search Radius
          </div>
          <div className="font-display font-bold text-xl text-foreground font-tabular">
            {requestData.radiusKm} km
          </div>
        </div>
      </div>

      {/* Progress */}
      <div className="glass border rounded-xl p-5 shadow-sm mb-6">
        <div className="flex items-center justify-between mb-3">
          <div className="text-sm font-medium text-foreground">
            Fulfillment Progress
          </div>
          <span
            className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
              pct >= 100
                ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                : 'bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400'
            }`}
          >
            {pct >= 100 ? 'Fulfilled' : 'In Progress'}
          </span>
        </div>
        <div className="h-2 bg-muted rounded-full overflow-hidden mb-1">
          <div
            className="h-full bg-red-500 rounded-full transition-all duration-700"
            style={{ width: `${Math.min(pct, 100)}%` }}
          />
        </div>
        <div className="text-xs text-muted-foreground font-tabular">
          {accepted} of {needed} units accepted
        </div>
      </div>

      {/* Donors list */}
      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <div className="px-5 py-3 border-b border-border flex items-center justify-between">
          <h2 className="font-display font-semibold text-sm text-muted-foreground uppercase tracking-wider">
            Notified Donors ({donors.length})
          </h2>
          <span className="text-xs text-muted-foreground font-tabular">
            Sorted by proximity
          </span>
        </div>

        {donors.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground text-sm">
            No donors have responded to this emergency request yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left bg-muted/50">
                  <th className="px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Donor
                  </th>
                  <th className="px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Proximity
                  </th>
                  <th className="px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Contact
                  </th>
                </tr>
              </thead>
              <tbody>
                {donors.map((d, i) => (
                  <tr
                    key={d.name + i}
                    className={`border-b border-border hover:bg-muted/50 transition-colors ${
                      i === donors.length - 1 ? 'border-0' : ''
                    }`}
                  >
                    <td className="px-5 py-3.5">
                      <div className="font-medium text-foreground">
                        {d.name}
                      </div>
                      {d.verified && (
                        <span className="text-xs text-muted-foreground">
                          ✓ Health Verified
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-3.5 text-muted-foreground font-tabular">
                      {d.distance}
                    </td>
                    <td className="px-5 py-3.5">
                      <span
                        className={`text-xs font-medium px-2.5 py-1 rounded-sm capitalize ${statusStyles[d.status] || ''}`}
                      >
                        {d.status}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-muted-foreground font-tabular">
                      {d.phone}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
