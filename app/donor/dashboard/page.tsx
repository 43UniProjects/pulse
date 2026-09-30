import Link from 'next/link';

const requests = [
  {
    id: 1,
    hospital: 'Nawaloka Hospital',
    bloodGroup: 'O+',
    distance: '1.2 km',
    urgency: 'Critical',
    address: 'Deshamanya H. K. Dharmadasa Mw, Colombo 02',
  },
  {
    id: 2,
    hospital: 'Asiri Central Hospital',
    bloodGroup: 'B+',
    distance: '3.4 km',
    urgency: 'High',
    address: 'Norris Canal Rd, Colombo 10',
  },
  {
    id: 3,
    hospital: 'Lanka Hospitals',
    bloodGroup: 'A-',
    distance: '5.1 km',
    urgency: 'Medium',
    address: 'Narahenpita Rd, Colombo 05',
  },
];

const urgencyColors: Record<string, string> = {
  Critical: 'bg-red-100 text-red-700',
  High: 'bg-orange-100 text-orange-700',
  Medium: 'bg-yellow-100 text-yellow-700',
};

export default function DonorDashboard() {
  return (
    <div className="p-8 max-w-3xl">
      <div className="mb-6 glass rounded-xl border px-5 py-4 shadow-sm">
        <div className="flex items-center gap-2.5 mb-1">
          <h1 className="font-display font-bold text-2xl text-black">
            Dashboard
          </h1>
          <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-green-100 text-green-700 inline-flex items-center gap-1">
            <span aria-hidden>✓</span> Verified Donor
          </span>
        </div>
        <p className="text-sm text-gray-500">Welcome back, Kamal</p>
      </div>

      {/* SMS alerts banner */}
      <div className="glass border rounded-xl p-4 shadow-sm flex items-start gap-3 mb-4">
        <span className="text-red-600 text-lg leading-6">✆</span>
        <div>
          <div className="text-sm font-medium text-black">
            SMS alerts are on
          </div>
          <div className="text-sm text-gray-500">
            We&apos;ll text +94 77 123 4567 the moment O+ blood is needed
            nearby.
          </div>
        </div>
      </div>

      {/* Eligibility Card */}
      <div className="border border-green-200 bg-green-50 rounded-lg p-5 flex items-center justify-between mb-8">
        <div>
          <div className="text-xs font-semibold text-green-700 uppercase tracking-wider mb-1">
            Donation Status
          </div>
          <div className="font-display font-bold text-lg text-green-800">
            Eligible to Donate
          </div>
          <div className="text-sm text-green-700 mt-0.5">
            Your last donation was on 12 Mar 2026 — over 90 days ago.
          </div>
        </div>
        <div className="w-10 h-10 rounded-full bg-green-200 flex items-center justify-center text-green-700 text-xl">
          ✓
        </div>
      </div>

      {/* Nearby Requests */}
      <div>
        <h2 className="font-display font-semibold text-sm text-gray-500 uppercase tracking-widest mb-4">
          Nearby Active Requests
        </h2>
        <div className="flex flex-col gap-3">
          {requests.map((r) => (
            <div
              key={r.id}
              className="glass border rounded-xl p-4 shadow-sm transition-shadow hover:shadow-md flex items-center justify-between"
            >
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-display font-semibold text-sm text-black">
                    {r.hospital}
                  </span>
                  <span
                    className={`text-xs font-medium px-2 py-0.5 rounded-full ${urgencyColors[r.urgency]}`}
                  >
                    {r.urgency}
                  </span>
                </div>
                <div className="text-xs text-gray-500">{r.address}</div>
                <div className="flex items-center gap-3 mt-2">
                  <span className="text-xs font-semibold bg-gray-100 text-gray-700 px-2 py-0.5 rounded">
                    {r.bloodGroup}
                  </span>
                  <span className="text-xs text-gray-400">{r.distance}</span>
                </div>
              </div>
              <Link
                href={`/donor/request/${r.id}`}
                className="ml-4 shrink-0 border border-gray-200 text-gray-700 text-xs font-medium px-3 py-1.5 rounded hover:bg-gray-50 transition-colors shadow-sm hover:shadow-md"
              >
                View
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
