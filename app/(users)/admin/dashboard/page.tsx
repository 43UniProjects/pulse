import { Metadata } from 'next';
import Link from 'next/link';
import { Suspense } from 'react';
import { validateRoleAccess } from '@/lib/auth/guard';
import { connectToDatabase } from '@/lib/db/connect';
import { Hospital } from '@/lib/models/hospital.model';
import { Donor } from '@/lib/models/donor.model';
import { DonationRequest } from '@/lib/models/donation-request.model';

export const metadata: Metadata = { title: 'Admin Dashboard' };

function AdminDashboardSkeleton() {
  return (
    <div className="p-8 space-y-6 animate-pulse">
      <div className="h-20 bg-muted/40 rounded-xl" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-28 bg-muted/40 rounded-xl" />
        ))}
      </div>
      <div className="h-64 bg-muted/40 rounded-lg" />
    </div>
  );
}

async function AdminDashboardContent() {
  await validateRoleAccess('admin');
  await connectToDatabase();

  const [
    totalHospitals,
    totalDonors,
    activeRequests,
    pendingVerifications,
    latestRequests,
    latestPendingHospitals,
  ] = await Promise.all([
    Hospital.countDocuments(),
    Donor.countDocuments(),
    DonationRequest.countDocuments({ status: 'pending' }),
    Hospital.countDocuments({ verificationStatus: 'pending' }),
    DonationRequest.find().sort({ createdAt: -1 }).limit(3).lean(),
    Hospital.find({ verificationStatus: 'pending' })
      .sort({ createdAt: -1 })
      .limit(3)
      .lean(),
  ]);

  const stats = [
    {
      label: 'Total Hospitals',
      value: totalHospitals.toLocaleString(),
      change: 'Registered medical centers',
    },
    {
      label: 'Total Donors',
      value: totalDonors.toLocaleString(),
      change: 'Registered voluntary donors',
    },
    {
      label: 'Active Requests',
      value: activeRequests.toLocaleString(),
      change: 'Pending fulfillment',
    },
    {
      label: 'Pending Verifications',
      value: pendingVerifications.toLocaleString(),
      change: pendingVerifications > 0 ? 'Needs review' : 'All clear',
      urgent: pendingVerifications > 0,
    },
  ];

  const activity: { time: string; text: string }[] = [];

  latestPendingHospitals.forEach((h) => {
    activity.push({
      time: h.createdAt
        ? new Intl.DateTimeFormat('en-GB', {
            hour: '2-digit',
            minute: '2-digit',
            day: '2-digit',
            month: 'short',
          }).format(new Date(h.createdAt))
        : 'Recent',
      text: `${h.name} (${h.city || 'Sri Lanka'}) submitted verification documents.`,
    });
  });

  latestRequests.forEach((req) => {
    activity.push({
      time: req.createdAt
        ? new Intl.DateTimeFormat('en-GB', {
            hour: '2-digit',
            minute: '2-digit',
            day: '2-digit',
            month: 'short',
          }).format(new Date(req.createdAt))
        : 'Recent',
      text: `Blood request ${req.requestId || req._id.toString()} (${req.bloodGroup}) broadcasted for ${req.hospitalName}.`,
    });
  });

  if (activity.length === 0) {
    activity.push({
      time: 'Just now',
      text: 'Pulse network systems operational and monitoring active requests.',
    });
  }

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
            className={`glass border rounded-xl p-5 shadow-sm transition-shadow hover:shadow-md ${
              s.urgent ? 'border-orange-500' : ''
            }`}
          >
            <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
              {s.label}
            </div>
            <div
              className={`font-display font-bold text-3xl mb-1 font-tabular ${
                s.urgent ? 'text-orange-600' : 'text-foreground'
              }`}
            >
              {s.value}
            </div>
            <div
              className={`text-xs ${
                s.urgent ? 'text-orange-500' : 'text-muted-foreground'
              }`}
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
          className="bg-red-600 text-white font-medium text-sm px-4 py-2 rounded hover:bg-red-700 transition-colors shadow-sm hover:shadow-md font-tabular"
        >
          Review Pending Verifications ({pendingVerifications})
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
            <div
              key={i}
              className="px-5 py-3.5 flex items-center justify-between text-sm hover:bg-secondary/20 transition-colors"
            >
              <span className="text-foreground">{a.text}</span>
              <span className="text-xs text-muted-foreground shrink-0 ml-4 font-tabular">
                {a.time}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  return (
    <Suspense fallback={<AdminDashboardSkeleton />}>
      <AdminDashboardContent />
    </Suspense>
  );
}
