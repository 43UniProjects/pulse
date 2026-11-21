'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { toggleUserStatusAction } from '@/actions/admin.actions';

export interface SerializedUser {
  id: string;
  name: string;
  role: string;
  email: string;
  status: 'Active' | 'Suspended';
}

const statusStyles: Record<string, string> = {
  Active:
    'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400',
  Suspended: 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400',
};

export default function ManageUsersClient({
  initialUsers,
}: {
  initialUsers: SerializedUser[];
}) {
  const [users, setUsers] = useState<SerializedUser[]>(initialUsers);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('All');
  const [pendingIds, setPendingIds] = useState<Set<string>>(new Set());

  const filtered = users.filter((u) => {
    const matchSearch =
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase());
    const matchRole =
      roleFilter === 'All' || u.role.toLowerCase() === roleFilter.toLowerCase();
    return matchSearch && matchRole;
  });

  async function toggleStatus(
    id: string,
    currentStatus: 'Active' | 'Suspended',
  ) {
    if (pendingIds.has(id)) return;

    const nextStatus = currentStatus === 'Active' ? 'Suspended' : 'Active';
    const nextActive = nextStatus === 'Active';

    setPendingIds((prev) => new Set(prev).add(id));
    // Optimistic UI update
    setUsers((us) =>
      us.map((u) => (u.id === id ? { ...u, status: nextStatus } : u)),
    );

    try {
      const res = await toggleUserStatusAction(id, nextActive);
      if (!res.success) {
        toast.error(res.error || 'Failed to update user status');
        // Revert optimistic update
        setUsers((us) =>
          us.map((u) => (u.id === id ? { ...u, status: currentStatus } : u)),
        );
      } else {
        toast.success(`User marked as ${nextStatus}`);
      }
    } catch {
      toast.error('Network error while updating user status');
      setUsers((us) =>
        us.map((u) => (u.id === id ? { ...u, status: currentStatus } : u)),
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
          Manage Users
        </h1>
        <p className="text-sm text-muted-foreground font-tabular">
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
          className="border border-border rounded px-3 py-2 text-sm outline-none focus:border-border transition-colors w-64 bg-background"
        />
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="border border-border rounded px-3 py-2 text-sm outline-none focus:border-border transition-colors bg-background"
        >
          <option>All</option>
          <option>Donor</option>
          <option>Hospital</option>
          <option>Admin</option>
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
                    className={`border-b border-border hover:bg-muted/50 transition-colors ${
                      i === filtered.length - 1 ? 'border-0' : ''
                    }`}
                  >
                    <td className="px-5 py-3.5 font-medium text-foreground">
                      {u.name}
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="text-xs font-semibold bg-muted text-foreground px-2 py-0.5 rounded capitalize">
                        {u.role}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-muted-foreground font-tabular">
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
                        onClick={() => toggleStatus(u.id, u.status)}
                        className={`text-xs font-medium px-2.5 py-1 rounded border transition-colors cursor-pointer ${
                          u.status === 'Active'
                            ? 'border-border text-muted-foreground hover:bg-muted/50 bg-transparent'
                            : 'border-green-200 dark:border-green-900/50 text-green-600 dark:text-green-400 bg-transparent dark:bg-green-950/20 hover:bg-green-50 dark:hover:bg-green-900/40'
                        }`}
                      >
                        {u.status === 'Active' ? 'Suspend' : 'Activate'}
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
                  <div className="flex justify-between items-start gap-2">
                    <div>
                      <h3 className="font-semibold text-foreground flex items-center gap-2">
                        {u.name}
                        <span className="text-xs font-semibold bg-muted text-foreground px-2 py-0.5 rounded capitalize">
                          {u.role}
                        </span>
                      </h3>
                      <div className="text-sm text-muted-foreground mt-1 font-tabular">
                        {u.email}
                      </div>
                    </div>
                    <span
                      className={`shrink-0 text-xs font-medium px-2 py-0.5 rounded-full ${statusStyles[u.status]}`}
                    >
                      {u.status}
                    </span>
                  </div>

                  <div className="pt-2 border-t border-border/50 flex justify-end">
                    <button
                      onClick={() => toggleStatus(u.id, u.status)}
                      className={`text-xs font-medium px-4 py-2 w-full sm:w-auto rounded border transition-colors shadow-sm cursor-pointer ${
                        u.status === 'Active'
                          ? 'border-border text-muted-foreground hover:bg-muted/50 bg-transparent'
                          : 'border-green-200 dark:border-green-900/50 text-green-600 dark:text-green-400 bg-transparent dark:bg-green-950/20 hover:bg-green-50 dark:hover:bg-green-900/40'
                      }`}
                    >
                      {u.status === 'Active' ? 'Suspend' : 'Activate'}
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
