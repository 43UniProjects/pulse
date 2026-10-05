import Link from 'next/link';

const requests = [
  {
    id: 1,
    bloodGroup: 'O+',
    quantity: '2 units',
    radius: '10 km',
    status: 'Active',
    date: '25 Sep 2026',
    responses: 4,
  },
  {
    id: 2,
    bloodGroup: 'A-',
    quantity: '1 unit',
    radius: '5 km',
    status: 'Fulfilled',
    date: '23 Sep 2026',
    responses: 2,
  },
  {
    id: 3,
    bloodGroup: 'B+',
    quantity: '3 units',
    radius: '20 km',
    status: 'Active',
    date: '22 Sep 2026',
    responses: 7,
  },
  {
    id: 4,
    bloodGroup: 'AB+',
    quantity: '1 unit',
    radius: '10 km',
    status: 'Expired',
    date: '18 Sep 2026',
    responses: 0,
  },
];

const statusStyles: Record<string, string> = {
  Active:
    'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400',
  Fulfilled: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400',
  Expired: 'bg-gray-100 dark:bg-gray-900/30 text-gray-500 dark:text-gray-400',
};

import { Metadata } from 'next';

export const metadata: Metadata = { title: 'Hospital Dashboard' };

export default function HospitalDashboard() {
  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6 glass rounded-xl border px-5 py-4 shadow-sm">
        <div>
          <h1 className="font-display font-bold text-2xl text-foreground mb-1">
            Hospital Dashboard
          </h1>
          <p className="text-sm text-muted-foreground">Nawaloka Hospital</p>
        </div>
        <Link
          href="/hospital/post-request"
          className="bg-red-600 text-white font-medium text-sm px-4 py-2 rounded hover:bg-red-700 transition-colors shadow-sm hover:shadow-md"
        >
          + Post New Request
        </Link>
      </div>

      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <div className="px-5 py-3 border-b border-border">
          <h2 className="font-display font-semibold text-sm text-muted-foreground uppercase tracking-wider">
            All Blood Requests
          </h2>
        </div>
        <div className="overflow-x-auto hidden md:block">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left bg-muted/50">
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
                  key={r.id}
                  className={`border-b border-border hover:bg-muted/50 transition-colors ${i === requests.length - 1 ? 'border-0' : ''}`}
                >
                  <td className="px-5 py-3.5">
                    <span className="font-semibold text-foreground">
                      {r.bloodGroup}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-muted-foreground">
                    {r.quantity}
                  </td>
                  <td className="px-5 py-3.5 text-muted-foreground">
                    {r.radius}
                  </td>
                  <td className="px-5 py-3.5">
                    <span
                      className={`text-xs font-medium px-2 py-0.5 rounded-full ${statusStyles[r.status]}`}
                    >
                      {r.status}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-muted-foreground">
                    {r.date}
                  </td>
                  <td className="px-5 py-3.5 text-muted-foreground">
                    {r.responses}
                  </td>
                  <td className="px-5 py-3.5">
                    <Link
                      href={`/hospital/tracking/${r.id}`}
                      className="text-xs font-medium text-red-600 hover:underline"
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
                key={r.id}
                className="p-4 flex flex-col gap-3 hover:bg-muted/30 transition-colors"
              >
                {/* Blood Group, Quantity and Status */}
                <div className="flex justify-between items-start gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-foreground text-lg">
                      {r.bloodGroup}
                    </span>
                    <span className="text-xs font-medium text-muted-foreground bg-secondary px-2 py-1 rounded-md">
                      {r.quantity}
                    </span>
                  </div>
                  <span
                    className={`shrink-0 text-xs font-medium px-2 py-0.5 rounded-full ${statusStyles[r.status]}`}
                  >
                    {r.status}
                  </span>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-2 gap-2 text-sm mt-1">
                  <div className="text-muted-foreground">Radius:</div>
                  <div className="text-foreground">{r.radius}</div>

                  <div className="text-muted-foreground">Date Posted:</div>
                  <div className="text-foreground">{r.date}</div>

                  <div className="text-muted-foreground">Responses:</div>
                  <div className="text-foreground font-medium">
                    {r.responses}
                  </div>
                </div>

                {/* Actions (Track Button) */}
                <div className="pt-3 mt-1 border-t border-border/50 flex justify-end">
                  <Link
                    href={`/hospital/tracking/${r.id}`}
                    className="text-xs font-medium bg-red-600 text-white px-4 py-2 w-full text-center rounded hover:bg-red-700 transition-colors shadow-sm"
                  >
                    Track Request
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
