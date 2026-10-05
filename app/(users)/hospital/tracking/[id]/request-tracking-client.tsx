type Donor = {
  name: string;
  distance: string;
  status: string;
  phone: string;
  verified: boolean;
};

const donors: Array<Donor> = [
  {
    name: 'Kamal Perera',
    distance: '1.2 km',
    status: 'Accepted',
    phone: '+94 77 123 4567',
    verified: true,
  },
  {
    name: 'Dilani Jayawardena',
    distance: '2.1 km',
    status: 'Notified',
    phone: '+94 76 234 5678',
    verified: true,
  },
  {
    name: 'Sunil Bandara',
    distance: '3.4 km',
    status: 'Declined',
    phone: '+94 71 345 6789',
    verified: false,
  },
  {
    name: 'Sanduni Ekanayake',
    distance: '4.0 km',
    status: 'Notified',
    phone: '+94 70 456 7890',
    verified: false,
  },
  {
    name: 'Tharindu Rathnayake',
    distance: '4.8 km',
    status: 'Accepted',
    phone: '+94 78 567 8901',
    verified: true,
  },
];

const statusStyles: Record<string, string> = {
  Notified: 'bg-muted text-muted-foreground',
  Accepted: 'bg-primary/10 text-primary',
  Declined: 'bg-destructive/10 text-destructive',
};

export default function RequestTrackingClient({ id }: { id: string }) {
  const accepted = donors.filter((d) => d.status === 'Accepted').length;
  const needed = 2;
  const pct = Math.round((accepted / needed) * 100);

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="mb-6 glass rounded-xl border px-5 py-4 shadow-sm">
        <h1 className="font-display font-bold text-2xl text-foreground mb-1">
          Request Tracking
        </h1>
        <p className="text-sm text-muted-foreground">
          Request #{id} — O+, 2 units, 10 km radius
        </p>
      </div>

      {/* Summary */}
      <div className="glass border rounded-xl p-5 shadow-sm mb-6 grid grid-cols-3 gap-5">
        <div>
          <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-0.5">
            Blood Group
          </div>
          <div className="font-display font-bold text-xl text-foreground">
            O+
          </div>
        </div>
        <div>
          <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-0.5">
            Quantity Needed
          </div>
          <div className="font-display font-bold text-xl text-foreground">
            2 units
          </div>
        </div>
        <div>
          <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-0.5">
            Search Radius
          </div>
          <div className="font-display font-bold text-xl text-foreground">
            10 km
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
            className={`text-xs font-semibold px-2 py-0.5 rounded-full ${pct >= 100 ? 'bg-primary/10 text-primary' : 'bg-secondary text-secondary-foreground'}`}
          >
            {pct >= 100 ? 'Fulfilled' : 'In Progress'}
          </span>
        </div>
        <div className="h-2 bg-muted rounded-full overflow-hidden mb-1">
          <div
            className="h-full bg-primary rounded-full transition-all duration-700"
            style={{ width: `${Math.min(pct, 100)}%` }}
          />
        </div>
        <div className="text-xs text-muted-foreground">
          {accepted} of {needed} units accepted
        </div>
      </div>

      {/* Matched Donors Table */}
      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <div className="px-5 py-3 border-b border-border">
          <h2 className="font-display font-semibold text-sm text-muted-foreground uppercase tracking-wider">
            Matched Donors
          </h2>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left bg-muted/50">
              <th className="px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Donor Name
              </th>
              <th className="px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Verification
              </th>
              <th className="px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Distance
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
                key={i}
                className={`border-b border-border hover:bg-muted/50 transition-colors ${i === donors.length - 1 ? 'border-0' : ''}`}
              >
                <td className="px-5 py-3.5 font-medium text-foreground">
                  {d.name}
                </td>
                <td className="px-5 py-3.5">
                  <span
                    className={`text-xs font-medium px-2 py-0.5 rounded-full inline-flex items-center gap-1 ${d.verified ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'}`}
                  >
                    <span aria-hidden>{d.verified ? '✓' : '○'}</span>{' '}
                    {d.verified ? 'Verified' : 'Unverified'}
                  </span>
                </td>
                <td className="px-5 py-3.5 text-muted-foreground">
                  {d.distance}
                </td>
                <td className="px-5 py-3.5">
                  <span
                    className={`text-xs font-medium px-2 py-0.5 rounded-full ${statusStyles[d.status]}`}
                  >
                    {d.status}
                  </span>
                </td>
                <td className="px-5 py-3.5">
                  <button className="text-xs font-medium text-foreground border border-border px-3 py-1 rounded bg-transparent hover:bg-muted/50 transition-colors shadow-sm hover:shadow-md">
                    {d.phone}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
