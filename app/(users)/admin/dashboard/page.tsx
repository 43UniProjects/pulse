import Link from 'next/link';

const stats = [
  { label: 'Total Hospitals', value: '142', change: '+3 this week' },
  { label: 'Total Donors', value: '8,471', change: '+127 this week' },
  { label: 'Active Requests', value: '34', change: '12 critical' },
  {
    label: 'Pending Verifications',
    value: '7',
    change: 'Needs review',
    urgent: true,
  },
];

const activity = [
  {
    time: '2 min ago',
    text: 'Asiri Central Hospital (Colombo) submitted verification documents.',
  },
  {
    time: '14 min ago',
    text: 'New donor Nadeesha Wickramasinghe registered — blood group B+.',
  },
  {
    time: '31 min ago',
    text: 'Blood request #312 (O+) fulfilled at Nawaloka Hospital, Colombo.',
  },
  {
    time: '1 hr ago',
    text: 'Base Hospital Negombo account suspended for invalid registration number.',
  },
  {
    time: '2 hrs ago',
    text: 'Admin approved National Hospital of Sri Lanka verification.',
  },
  { time: '3 hrs ago', text: 'System: 5 expired requests auto-closed.' },
];

import { Metadata } from 'next';

export const metadata: Metadata = { title: 'Admin Dashboard' };

export default function AdminDashboard() {
  return (
    <div className="p-8">
      <div className="mb-6 glass rounded-xl border px-5 py-4 shadow-sm">
        <h1 className="font-display font-bold text-2xl text-foreground mb-1">
          Admin Dashboard
        </h1>
        <p className="text-muted-foreground">Pulse network overview</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((s) => (
          <div
            key={s.label}
            className={`glass border rounded-xl p-5 shadow-sm transition-shadow hover:shadow-md ${s.urgent ? 'border-orange-500' : ''}`}
          >
            <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
              {s.label}
            </div>
            <div
              className={`font-display font-bold text-3xl mb-1 ${s.urgent ? 'text-orange-600' : 'text-foreground'}`}
            >
              {s.value}
            </div>
            <div
              className={`text-xs ${s.urgent ? 'text-orange-500' : 'text-muted-foreground'}`}
            >
              {s.change}
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="flex gap-3 mb-8">
        <Link
          href="/admin/verify-hospitals"
          className="bg-red-600 text-white font-medium text-sm px-4 py-2 rounded hover:bg-red-700 transition-colors shadow-sm hover:shadow-md"
        >
          Review Pending Verifications (7)
        </Link>
        <Link
          href="/admin/manage-users"
          className="border border-border text-muted-foreground font-medium text-sm px-4 py-2 rounded hover:bg-card transition-colors shadow-sm hover:shadow-md"
        >
          Manage Users
        </Link>
      </div>

      {/* Activity */}
      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <div className="px-5 py-3 border-b border-border">
          <h2 className="font-display font-semibold text-sm text-muted-foreground uppercase tracking-wider">
            Recent Activity
          </h2>
        </div>
        <div className="divide-y divide-border">
          {activity.map((a, i) => (
            <div key={i} className="px-5 py-3.5 flex items-start gap-4">
              <div className="text-xs text-muted-foreground whitespace-nowrap mt-0.5 w-16 shrink-0">
                {a.time}
              </div>
              <div className="text-sm text-muted-foreground">{a.text}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
