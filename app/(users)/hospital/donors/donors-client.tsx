'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { toggleDonorVerification } from '@/actions/hospital.actions';

export interface SerializedDonor {
  _id: string;
  name: string;
  bloodGroup: string;
  phone: string;
  address: string;
  registered: string;
  verified: boolean;
}

export default function DonorsClient({
  initialDonors,
}: {
  initialDonors: SerializedDonor[];
}) {
  const [donors, setDonors] = useState<SerializedDonor[]>(initialDonors);
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

  async function handleToggleVerified(id: string, currentStatus: boolean) {
    const nextStatus = !currentStatus;
    // Optimistic UI update
    setDonors((prev) =>
      prev.map((d) => (d._id === id ? { ...d, verified: nextStatus } : d)),
    );

    const res = await toggleDonorVerification(id, nextStatus);
    if (!res.success) {
      toast.error('Failed to update donor status');
      // Revert optimistic update
      setDonors((prev) =>
        prev.map((d) => (d._id === id ? { ...d, verified: currentStatus } : d)),
      );
    } else {
      toast.success(
        nextStatus ? 'Donor marked as verified' : 'Donor marked as unverified',
      );
    }
  }

  return (
    <div className="p-8">
      <div className="mb-6 glass rounded-xl border px-5 py-4 shadow-sm">
        <h1 className="font-display font-bold text-2xl text-foreground mb-1">
          Registered Donors
        </h1>
        <p className="text-sm text-muted-foreground">
          {donors.length} donors registered — {pending} awaiting health
          verification
        </p>
      </div>

      {/* Note */}
      <div className="border border-border bg-muted/20 rounded-lg p-4 flex items-start gap-3 mb-5">
        <span className="text-red-600 text-lg leading-6">ⓘ</span>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Donors receive alerts once registered, but their clinical eligibility
          must be verified before they can donate. Mark a donor{' '}
          <span className="font-medium text-foreground">Verified</span> after
          their screening is complete, or set them back to{' '}
          <span className="font-medium text-foreground">Unverified</span> if
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
          className="border border-border rounded px-3 py-2 text-sm outline-none focus:border-border transition-colors w-64 bg-background"
        />
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="border border-border rounded px-3 py-2 text-sm outline-none focus:border-border transition-colors bg-background"
        >
          <option>All</option>
          <option>Verified</option>
          <option>Unverified</option>
        </select>
      </div>

      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <div className="overflow-x-auto hidden md:block">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left bg-muted/50">
                <th className="px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Donor Name
                </th>
                <th className="px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Blood Group
                </th>
                <th className="px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Phone
                </th>
                <th className="px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Location
                </th>
                <th className="px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Registered
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
                    colSpan={7}
                    className="px-5 py-8 text-center text-muted-foreground text-sm"
                  >
                    No donors match your filters.
                  </td>
                </tr>
              ) : (
                filtered.map((d, i) => (
                  <tr
                    key={d._id}
                    className={`border-b border-border hover:bg-muted/50 transition-colors ${
                      i === filtered.length - 1 ? 'border-0' : ''
                    }`}
                  >
                    <td className="px-5 py-3.5 font-medium text-foreground">
                      {d.name}
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="text-xs font-semibold bg-muted text-foreground px-2 py-0.5 rounded">
                        {d.bloodGroup}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-muted-foreground font-tabular">
                      {d.phone}
                    </td>
                    <td className="px-5 py-3.5 text-muted-foreground">
                      {d.address}
                    </td>
                    <td className="px-5 py-3.5 text-muted-foreground font-tabular">
                      {d.registered}
                    </td>
                    <td className="px-5 py-3.5">
                      <span
                        className={`text-xs font-medium px-2 py-0.5 rounded-full inline-flex items-center gap-1 ${
                          d.verified
                            ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                            : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400'
                        }`}
                      >
                        <span aria-hidden>{d.verified ? '✓' : '○'}</span>{' '}
                        {d.verified ? 'Verified' : 'Unverified'}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <button
                        onClick={() => handleToggleVerified(d._id, d.verified)}
                        className={`text-xs font-medium px-2.5 py-1 rounded border transition-colors cursor-pointer ${
                          d.verified
                            ? 'border-border text-muted-foreground hover:bg-muted/50 bg-transparent'
                            : 'border-green-200 dark:border-green-900/50 text-green-600 dark:text-green-400 bg-transparent dark:bg-green-950/20 hover:bg-green-50 dark:hover:bg-green-900/40'
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

        {/* MOBILE CARD VIEW */}
        <div className="block md:hidden">
          {filtered.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground text-sm">
              No donors match your filters.
            </div>
          ) : (
            <div className="flex flex-col divide-y divide-border">
              {filtered.map((d) => (
                <div
                  key={d._id}
                  className="p-4 flex flex-col gap-3 hover:bg-muted/30 transition-colors"
                >
                  <div className="flex justify-between items-start gap-2">
                    <div>
                      <h3 className="font-semibold text-foreground flex items-center gap-2">
                        {d.name}
                        <span className="text-xs font-bold bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 px-2 py-0.5 rounded-full">
                          {d.bloodGroup}
                        </span>
                      </h3>
                      <div className="text-sm text-muted-foreground mt-1.5 flex items-center gap-1">
                        📍 {d.address}
                      </div>
                    </div>
                    <span
                      className={`shrink-0 text-xs font-medium px-2 py-0.5 rounded-full inline-flex items-center gap-1 ${
                        d.verified
                          ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                          : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400'
                      }`}
                    >
                      <span aria-hidden>{d.verified ? '✓' : '○'}</span>{' '}
                      {d.verified ? 'Verified' : 'Unverified'}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-sm mt-1">
                    <div className="text-muted-foreground">Phone:</div>
                    <div className="text-foreground font-tabular">
                      {d.phone}
                    </div>

                    <div className="text-muted-foreground">Registered:</div>
                    <div className="text-foreground font-tabular">
                      {d.registered}
                    </div>
                  </div>

                  <div className="pt-3 mt-1 border-t border-border/50 flex justify-end">
                    <button
                      onClick={() => handleToggleVerified(d._id, d.verified)}
                      className={`text-xs font-medium px-4 py-2 w-full sm:w-auto rounded border transition-colors shadow-sm cursor-pointer ${
                        d.verified
                          ? 'border-border text-muted-foreground hover:bg-muted/50 bg-transparent'
                          : 'border-green-200 dark:border-green-900/50 text-green-600 dark:text-green-400 bg-transparent dark:bg-green-950/20 hover:bg-green-50 dark:hover:bg-green-900/40'
                      }`}
                    >
                      {d.verified ? 'Mark Unverified' : 'Mark Verified'}
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
