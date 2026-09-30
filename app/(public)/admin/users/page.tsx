import { useState } from 'react';

const initialUsers = [
  {
    id: 1,
    name: 'Kamal Perera',
    role: 'Donor',
    email: 'kamal@example.lk',
    status: 'Active',
  },
  {
    id: 2,
    name: 'Dilani Jayawardena',
    role: 'Donor',
    email: 'dilani@example.lk',
    status: 'Active',
  },
  {
    id: 3,
    name: 'Nawaloka Hospital',
    role: 'Hospital',
    email: 'admin@nawaloka.lk',
    status: 'Active',
  },
  {
    id: 4,
    name: 'Sunil Bandara',
    role: 'Donor',
    email: 'sunil@example.lk',
    status: 'Suspended',
  },
  {
    id: 5,
    name: 'Asiri Central Hospital',
    role: 'Hospital',
    email: 'info@asiri.lk',
    status: 'Active',
  },
  {
    id: 6,
    name: 'Sanduni Ekanayake',
    role: 'Donor',
    email: 'sanduni@example.lk',
    status: 'Active',
  },
  {
    id: 7,
    name: 'Base Hospital Negombo',
    role: 'Hospital',
    email: 'admin@bhnegombo.lk',
    status: 'Suspended',
  },
  {
    id: 8,
    name: 'Tharindu Rathnayake',
    role: 'Donor',
    email: 'tharindu@example.lk',
    status: 'Active',
  },
];

const statusStyles: Record<string, string> = {
  Active: 'bg-green-100 text-green-700',
  Suspended: 'bg-red-100 text-red-600',
};

export default function ManageUsers() {
  const [users, setUsers] = useState(initialUsers);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('All');

  const filtered = users.filter((u) => {
    const matchSearch =
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase());
    const matchRole = roleFilter === 'All' || u.role === roleFilter;
    return matchSearch && matchRole;
  });

  function toggleStatus(id: number) {
    setUsers((us) =>
      us.map((u) =>
        u.id === id
          ? { ...u, status: u.status === 'Active' ? 'Suspended' : 'Active' }
          : u,
      ),
    );
  }

  return (
    <div className="p-8">
      <div className="mb-6 glass rounded-xl border px-5 py-4 shadow-sm">
        <h1 className="font-display font-bold text-2xl text-black mb-1">
          Manage Users
        </h1>
        <p className="text-sm text-gray-500">
          {users.length} users on the platform
        </p>
      </div>

      {/* Filters */}
      <div className="flex gap-3 mb-5">
        <input
          type="text"
          placeholder="Search by name or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border border-gray-200 rounded px-3 py-2 text-sm outline-none focus:border-gray-400 transition-colors w-64"
        />
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="border border-gray-200 rounded px-3 py-2 text-sm outline-none focus:border-gray-400 transition-colors bg-white"
        >
          <option>All</option>
          <option>Donor</option>
          <option>Hospital</option>
        </select>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 text-left bg-gray-50">
                <th className="px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  Email
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
                    colSpan={5}
                    className="px-5 py-8 text-center text-gray-400 text-sm"
                  >
                    No users match your filters.
                  </td>
                </tr>
              ) : (
                filtered.map((u, i) => (
                  <tr
                    key={u.id}
                    className={`border-b border-gray-50 hover:bg-gray-50 transition-colors ${i === filtered.length - 1 ? 'border-0' : ''}`}
                  >
                    <td className="px-5 py-3.5 font-medium text-black">
                      {u.name}
                    </td>
                    <td className="px-5 py-3.5">
                      <span
                        className={`text-xs font-medium px-2 py-0.5 rounded-full ${u.role === 'Donor' ? 'bg-blue-50 text-blue-600' : 'bg-purple-50 text-purple-600'}`}
                      >
                        {u.role}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-gray-500">{u.email}</td>
                    <td className="px-5 py-3.5">
                      <span
                        className={`text-xs font-medium px-2 py-0.5 rounded-full ${statusStyles[u.status]}`}
                      >
                        {u.status}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <button
                        onClick={() => toggleStatus(u.id)}
                        className={`text-xs font-medium px-2.5 py-1 rounded border transition-colors ${
                          u.status === 'Active'
                            ? 'border-red-200 text-red-600 hover:bg-red-50'
                            : 'border-green-200 text-green-600 hover:bg-green-50'
                        }`}
                      >
                        {u.status === 'Active' ? 'Suspend' : 'Reactivate'}
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
