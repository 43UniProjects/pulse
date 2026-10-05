'use client';
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
  Active:
    'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400',
  Suspended: 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400',
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
        <h1 className="font-display font-bold text-2xl text-foreground mb-1">
          Manage Users
        </h1>
        <p className="text-sm text-muted-foreground">
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
          className="border border-border rounded px-3 py-2 text-sm outline-none focus:border-border transition-colors w-64"
        />
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="border border-border rounded px-3 py-2 text-sm outline-none focus:border-border transition-colors bg-background"
        >
          <option>All</option>
          <option>Donor</option>
          <option>Hospital</option>
        </select>
      </div>

      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <div className="overflow-x-auto hidden md:block">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left bg-muted/50">
                <th className="px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Name
                </th>
                <th className="px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Role
                </th>
                <th className="px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Email
                </th>
                <th className="px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Status
                </th>
                <th className="px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-5 py-8 text-center text-muted-foreground text-sm"
                  >
                    No users match your filters.
                  </td>
                </tr>
              ) : (
                filtered.map((u, i) => (
                  <tr
                    key={u.id}
                    className={`border-b border-border hover:bg-muted/50 transition-colors ${i === filtered.length - 1 ? 'border-0' : ''}`}
                  >
                    <td className="px-5 py-3.5 font-medium text-foreground">
                      {u.name}
                    </td>
                    <td className="px-5 py-3.5">
                      <span
                        className={`text-xs font-medium px-2 py-0.5 rounded-full ${u.role === 'Donor' ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' : 'bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400'}`}
                      >
                        {u.role}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-muted-foreground">
                      {u.email}
                    </td>
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
                            ? 'border-red-200 dark:border-red-900/50 text-red-600 dark:text-red-400 bg-transparent dark:bg-red-950/20 hover:bg-red-50 dark:hover:bg-red-900/40'
                            : 'border-green-200 dark:border-green-900/50 text-green-600 dark:text-green-400 bg-transparent dark:bg-green-950/20 hover:bg-green-50 dark:hover:bg-green-900/40'
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
        {/* MOBILE CARD VIEW */}
        <div className="block md:hidden">
          {filtered.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground text-sm">
              No users match your filters.
            </div>
          ) : (
            <div className="flex flex-col divide-y divide-border">
              {filtered.map((u) => (
                <div
                  key={u.id}
                  className="p-4 flex flex-col gap-3 hover:bg-muted/30 transition-colors"
                >
                  {/* Name and Status */}
                  <div className="flex justify-between items-start gap-2">
                    <div>
                      <h3 className="font-semibold text-foreground">
                        {u.name}
                      </h3>
                      <div className="mt-1.5">
                        <span
                          className={`text-xs font-medium px-2 py-0.5 rounded-full ${u.role === 'Donor' ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' : 'bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400'}`}
                        >
                          {u.role}
                        </span>
                      </div>
                    </div>
                    <span
                      className={`shrink-0 text-xs font-medium px-2 py-0.5 rounded-full ${statusStyles[u.status]}`}
                    >
                      {u.status}
                    </span>
                  </div>

                  {/* Email */}
                  <div className="text-sm mt-1">
                    <span className="text-muted-foreground mr-2">Email:</span>
                    <span className="text-foreground">{u.email}</span>
                  </div>

                  {/* Actions */}
                  <div className="pt-3 mt-1 border-t border-border/50 flex justify-end">
                    <button
                      onClick={() => toggleStatus(u.id)}
                      className={`text-xs font-medium px-4 py-2 w-full sm:w-auto rounded border transition-colors shadow-sm ${
                        u.status === 'Active'
                          ? 'border-red-200 dark:border-red-900/50 text-red-600 dark:text-red-400 bg-transparent dark:bg-red-950/20 hover:bg-red-50 dark:hover:bg-red-900/40'
                          : 'border-green-200 dark:border-green-900/50 text-green-600 dark:text-green-400 bg-transparent dark:bg-green-950/20 hover:bg-green-50 dark:hover:bg-green-900/40'
                      }`}
                    >
                      {u.status === 'Active'
                        ? 'Suspend User'
                        : 'Reactivate User'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
