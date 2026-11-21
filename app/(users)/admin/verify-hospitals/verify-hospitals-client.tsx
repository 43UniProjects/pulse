'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { verifyHospitalAction } from '@/actions/admin.actions';

export type HospitalStatus = 'Pending' | 'Approved' | 'Rejected';

export interface SerializedHospitalVerification {
  id: string;
  name: string;
  regNo: string;
  email: string;
  date: string;
  status: HospitalStatus;
}

const statusStyles: Record<HospitalStatus, string> = {
  Pending:
    'bg-yellow-50 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400',
  Approved:
    'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400',
  Rejected: 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400',
};

export default function VerifyHospitalsClient({
  initialHospitals,
}: {
  initialHospitals: SerializedHospitalVerification[];
}) {
  const [hospitals, setHospitals] =
    useState<SerializedHospitalVerification[]>(initialHospitals);
  const [filterStatus, setFilterStatus] = useState<string>('All');
  const [search, setSearch] = useState<string>('');
  const [pendingIds, setPendingIds] = useState<Set<string>>(new Set());

  const pendingCount = hospitals.filter((h) => h.status === 'Pending').length;

  const filteredHospitals = hospitals.filter((h) => {
    const matchesFilter =
      filterStatus === 'All' ||
      h.status.toLowerCase() === filterStatus.toLowerCase();
    const matchesSearch =
      h.name.toLowerCase().includes(search.toLowerCase()) ||
      h.email.toLowerCase().includes(search.toLowerCase()) ||
      h.regNo.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  async function update(id: string, status: HospitalStatus) {
    if (pendingIds.has(id)) return;

    const prevHospital = hospitals.find((h) => h.id === id);
    if (!prevHospital) return;

    setPendingIds((prev) => new Set(prev).add(id));
    // Optimistic UI update
    setHospitals((hs) => hs.map((h) => (h.id === id ? { ...h, status } : h)));

    const action =
      status === 'Approved'
        ? 'approve'
        : status === 'Rejected'
          ? 'reject'
          : 'pending';

    try {
      const res = await verifyHospitalAction(id, action);
      if (!res.success) {
        toast.error(
          res.error || 'Failed to update hospital verification status',
        );
        // Revert optimistic update
        setHospitals((hs) =>
          hs.map((h) =>
            h.id === id ? { ...h, status: prevHospital.status } : h,
          ),
        );
      } else {
        toast.success(
          status === 'Pending'
            ? 'Verification reset to pending'
            : `Hospital successfully ${status.toLowerCase()}`,
        );
      }
    } catch {
      toast.error('Network error while updating hospital status');
      setHospitals((hs) =>
        hs.map((h) =>
          h.id === id ? { ...h, status: prevHospital.status } : h,
        ),
      );
    } finally {
      setPendingIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }
  }

  return (
    <div className="p-8">
      <div className="mb-6 glass rounded-xl border px-5 py-4 shadow-sm">
        <h1 className="font-display font-bold text-2xl text-foreground mb-1">
          Verify Hospitals
        </h1>
        <p className="text-sm text-muted-foreground font-tabular">
          {pendingCount} pending verification{pendingCount === 1 ? '' : 's'}
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-wrap gap-3 mb-5">
        <input
          type="text"
          placeholder="Search by facility, email or reg..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border border-border rounded px-3 py-2 text-sm outline-none focus:border-border transition-colors w-64 bg-background"
        />
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="border border-border rounded px-3 py-2 text-sm outline-none focus:border-border transition-colors bg-background"
        >
          <option value="All">All Statuses</option>
          <option value="Pending">Pending</option>
          <option value="Approved">Approved</option>
          <option value="Rejected">Rejected</option>
        </select>
      </div>

      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <div className="overflow-x-auto hidden md:block">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left bg-muted/50">
                <th className="px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Hospital Name
                </th>
                <th className="px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Reg. Number
                </th>
                <th className="px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Email
                </th>
                <th className="px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Date Applied
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
              {filteredHospitals.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-5 py-8 text-center text-muted-foreground text-sm"
                  >
                    No hospitals found matching current criteria.
                  </td>
                </tr>
              ) : (
                filteredHospitals.map((h, i) => (
                  <tr
                    key={h.id}
                    className={`border-b border-border hover:bg-muted/50 transition-colors ${
                      i === filteredHospitals.length - 1 ? 'border-0' : ''
                    }`}
                  >
                    <td className="px-5 py-3.5 font-medium text-foreground">
                      {h.name}
                    </td>
                    <td className="px-5 py-3.5 text-muted-foreground font-mono text-xs">
                      {h.regNo}
                    </td>
                    <td className="px-5 py-3.5 text-muted-foreground">
                      {h.email}
                    </td>
                    <td className="px-5 py-3.5 text-muted-foreground font-tabular">
                      {h.date}
                    </td>
                    <td className="px-5 py-3.5">
                      <span
                        className={`text-xs font-medium px-2 py-0.5 rounded-full ${statusStyles[h.status]}`}
                      >
                        {h.status}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      {h.status === 'Pending' ? (
                        <div className="flex gap-2">
                          <button
                            onClick={() => update(h.id, 'Approved')}
                            className="text-xs font-medium bg-green-600 text-white px-2.5 py-1 rounded hover:bg-green-700 transition-colors shadow-sm hover:shadow-md cursor-pointer"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => update(h.id, 'Rejected')}
                            className="text-xs font-medium bg-background dark:bg-red-950/20 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-900/50 px-2.5 py-1 rounded hover:bg-red-50 dark:hover:bg-red-900/40 transition-colors shadow-sm hover:shadow-md cursor-pointer"
                          >
                            Reject
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => update(h.id, 'Pending')}
                          className="text-xs font-medium bg-secondary text-secondary-foreground border border-border px-3 py-1.5 rounded-md hover:bg-secondary/80 transition-all hover:shadow-md active:scale-[0.98] cursor-pointer"
                        >
                          Undo
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* MOBILE CARD VIEW */}
        <div className="block md:hidden">
          <div className="flex flex-col divide-y divide-border">
            {filteredHospitals.length === 0 ? (
              <div className="p-6 text-center text-muted-foreground text-sm">
                No hospitals found matching current criteria.
              </div>
            ) : (
              filteredHospitals.map((h) => (
                <div
                  key={h.id}
                  className="p-4 flex flex-col gap-3 hover:bg-muted/30 transition-colors"
                >
                  {/* Name, Reg No and Status */}
                  <div className="flex justify-between items-start gap-2">
                    <div>
                      <h3 className="font-semibold text-foreground">
                        {h.name}
                      </h3>
                      <p className="text-xs font-mono text-muted-foreground mt-1">
                        Reg: {h.regNo}
                      </p>
                    </div>
                    <span
                      className={`shrink-0 text-xs font-medium px-2 py-0.5 rounded-full ${statusStyles[h.status]}`}
                    >
                      {h.status}
                    </span>
                  </div>

                  {/* Details Grid */}
                  <div className="grid grid-cols-2 gap-2 text-sm mt-1">
                    <div className="text-muted-foreground">Email:</div>
                    <div className="text-foreground truncate">{h.email}</div>
                    <div className="text-muted-foreground">Date:</div>
                    <div className="text-foreground font-tabular">{h.date}</div>
                  </div>

                  {/* Actions (Buttons) */}
                  <div className="pt-3 mt-1 border-t border-border/50 flex justify-end">
                    {h.status === 'Pending' ? (
                      <div className="flex gap-2 w-full sm:w-auto">
                        <button
                          onClick={() => update(h.id, 'Approved')}
                          className="flex-1 sm:flex-none text-xs font-medium bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition-colors shadow-sm cursor-pointer"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => update(h.id, 'Rejected')}
                          className="flex-1 sm:flex-none text-xs font-medium bg-background text-red-600 border border-red-200 px-4 py-2 rounded hover:bg-red-50 transition-colors shadow-sm cursor-pointer"
                        >
                          Reject
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => update(h.id, 'Pending')}
                        className="text-xs font-medium bg-secondary text-secondary-foreground border border-border px-4 py-2 rounded-md hover:bg-secondary/80 transition-all hover:shadow-md active:scale-[0.98] cursor-pointer"
                      >
                        Undo Action
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
