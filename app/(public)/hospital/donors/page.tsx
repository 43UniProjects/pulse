import { useState } from 'react';

const initialDonors = [
  {
    id: 1,
    name: 'Kamal Perera',
    bloodGroup: 'O+',
    phone: '+94 77 123 4567',
    address: 'Nugegoda, Colombo',
    registered: '18 Sep 2026',
    verified: true,
  },
  {
    id: 2,
    name: 'Dilani Jayawardena',
    bloodGroup: 'B+',
    phone: '+94 76 234 5678',
    address: 'Maharagama, Colombo',
    registered: '20 Sep 2026',
    verified: true,
  },
  {
    id: 3,
    name: 'Sunil Bandara',
    bloodGroup: 'A-',
    phone: '+94 71 345 6789',
    address: 'Peradeniya, Kandy',
    registered: '22 Sep 2026',
    verified: false,
  },
  {
    id: 4,
    name: 'Sanduni Ekanayake',
    bloodGroup: 'AB+',
    phone: '+94 70 456 7890',
    address: 'Dehiwala, Colombo',
    registered: '24 Sep 2026',
    verified: false,
  },
  {
    id: 5,
    name: 'Tharindu Rathnayake',
    bloodGroup: 'O-',
    phone: '+94 78 567 8901',
    address: 'Katubedda, Moratuwa',
    registered: '25 Sep 2026',
    verified: true,
  },
  {
    id: 6,
    name: 'Nadeesha Wickramasinghe',
    bloodGroup: 'B+',
    phone: '+94 77 678 9012',
    address: 'Wattala, Gampaha',
    registered: '26 Sep 2026',
    verified: false,
  },
  {
    id: 7,
    name: 'Ruwan Dissanayake',
    bloodGroup: 'A+',
    phone: '+94 72 789 0123',
    address: 'Kadawatha, Gampaha',
    registered: '27 Sep 2026',
    verified: false,
  },
];

export default function RegisteredDonors() {
  const [donors, setDonors] = useState(initialDonors);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('All');

  const filtered = donors.filter((d) => {
    const matchSearch =
      d.name.toLowerCase().includes(search.toLowerCase()) ||
      d.bloodGroup.toLowerCase().includes(search.toLowerCase());
    const matchFilter =
      filter === 'All' ||
      (filter === 'Verified' && d.verified) ||
      (filter === 'Unverified' && !d.verified);
    return matchSearch && matchFilter;
  });

  const pending = donors.filter((d) => !d.verified).length;

  function toggleVerified(id: number) {
    setDonors((ds) =>
      ds.map((d) => (d.id === id ? { ...d, verified: !d.verified } : d)),
    );
  }

  return (
    <div className="p-8">
      <div className="mb-6 glass rounded-xl border px-5 py-4 shadow-sm">
        <h1 className="font-display font-bold text-2xl text-black mb-1">
          Registered Donors
        </h1>
        <p className="text-sm text-gray-500">
          {donors.length} donors registered — {pending} awaiting health
          verification
        </p>
      </div>

      {/* Note */}
      <div className="border border-gray-200 bg-white rounded-lg p-4 flex items-start gap-3 mb-5">
        <span className="text-red-600 text-lg leading-6">ⓘ</span>
        <p className="text-sm text-gray-500 leading-relaxed">
          Donors receive SMS alerts once registered, but their health status
          must be verified here before they can donate. Mark a donor{' '}
          <span className="font-medium text-gray-700">Verified</span> after
          their screening is complete, or set them back to{' '}
          <span className="font-medium text-gray-700">Unverified</span> if
          needed.
        </p>
      </div>

      {/* Filters */}
      <div className="flex gap-3 mb-5">
        <input
          type="text"
          placeholder="Search by name or blood group..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border border-gray-200 rounded px-3 py-2 text-sm outline-none focus:border-gray-400 transition-colors w-64"
        />
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="border border-gray-200 rounded px-3 py-2 text-sm outline-none focus:border-gray-400 transition-colors bg-white"
        >
          <option>All</option>
          <option>Verified</option>
          <option>Unverified</option>
        </select>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 text-left bg-gray-50">
                <th className="px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  Donor Name
                </th>
                <th className="px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  Blood Group
                </th>
                <th className="px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  Phone
                </th>
                <th className="px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  Location
                </th>
                <th className="px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  Registered
                </th>
                <th className="px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-5 py-8 text-center text-gray-400 text-sm"
                  >
                    No donors match your filters.
                  </td>
                </tr>
              ) : (
                filtered.map((d, i) => (
                  <tr
                    key={d.id}
                    className={`border-b border-gray-50 hover:bg-gray-50 transition-colors ${i === filtered.length - 1 ? 'border-0' : ''}`}
                  >
                    <td className="px-5 py-3.5 font-medium text-black">
                      {d.name}
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="text-xs font-semibold bg-gray-100 text-gray-700 px-2 py-0.5 rounded">
                        {d.bloodGroup}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-gray-500">{d.phone}</td>
                    <td className="px-5 py-3.5 text-gray-500">{d.address}</td>
                    <td className="px-5 py-3.5 text-gray-500">
                      {d.registered}
                    </td>
                    <td className="px-5 py-3.5">
                      <span
                        className={`text-xs font-medium px-2 py-0.5 rounded-full inline-flex items-center gap-1 ${d.verified ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}
                      >
                        <span aria-hidden>{d.verified ? '✓' : '○'}</span>{' '}
                        {d.verified ? 'Verified' : 'Unverified'}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <button
                        onClick={() => toggleVerified(d.id)}
                        className={`text-xs font-medium px-2.5 py-1 rounded border transition-colors ${
                          d.verified
                            ? 'border-gray-200 text-gray-600 hover:bg-gray-50'
                            : 'border-green-200 text-green-600 hover:bg-green-50'
                        }`}
                      >
                        {d.verified ? 'Mark Unverified' : 'Mark Verified'}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
