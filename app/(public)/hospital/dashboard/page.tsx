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
  Active: 'bg-green-100 text-green-700',
  Fulfilled: 'bg-blue-100 text-blue-700',
  Expired: 'bg-gray-100 text-gray-500',
};

export default function HospitalDashboard() {
  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6 glass rounded-xl border px-5 py-4 shadow-sm">
        <div>
          <h1 className="font-display font-bold text-2xl text-black mb-1">
            Hospital Dashboard
          </h1>
          <p className="text-sm text-gray-500">Nawaloka Hospital</p>
        </div>
        <Link
          href="/hospital/post-request"
          className="bg-red-600 text-white font-medium text-sm px-4 py-2 rounded hover:bg-red-700 transition-colors shadow-sm hover:shadow-md"
        >
          + Post New Request
        </Link>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <div className="px-5 py-3 border-b border-gray-100">
          <h2 className="font-display font-semibold text-sm text-gray-500 uppercase tracking-wider">
            All Blood Requests
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 text-left">
                <th className="px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  Blood Group
                </th>
                <th className="px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  Quantity
                </th>
                <th className="px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  Radius
                </th>
                <th className="px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  Date Posted
                </th>
                <th className="px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  Responses
                </th>
                <th className="px-5 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {requests.map((r, i) => (
                <tr
                  key={r.id}
                  className={`border-b border-gray-50 hover:bg-gray-50 transition-colors ${i === requests.length - 1 ? 'border-0' : ''}`}
                >
                  <td className="px-5 py-3.5">
                    <span className="font-semibold text-black">
                      {r.bloodGroup}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-gray-600">{r.quantity}</td>
                  <td className="px-5 py-3.5 text-gray-600">{r.radius}</td>
                  <td className="px-5 py-3.5">
                    <span
                      className={`text-xs font-medium px-2 py-0.5 rounded-full ${statusStyles[r.status]}`}
                    >
                      {r.status}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-gray-500">{r.date}</td>
                  <td className="px-5 py-3.5 text-gray-600">{r.responses}</td>
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
      </div>
    </div>
  );
}
