import { Metadata } from 'next';
import Link from 'next/link';
import {
  ShieldCheck,
  MessageSquare,
  Clock,
  MapPin,
  ChevronRight,
  Activity,
  AlertCircle,
  Droplet,
} from 'lucide-react';
import {
  getDonor,
  getDonationRequests,
  RequestDetails,
} from '../requests/data';

export const metadata: Metadata = {
  title: 'Donor Dashboard | Pulse',
  description: 'View your donation status and nearby emergency requests.',
};

export default async function DonorDashboard() {
  // In a real application, you would get this ID from the authenticated session
  const donorId = '1';
  const donor = getDonor(donorId);
  const activeRequests = Object.values(getDonationRequests(donorId));

  if (!donor) {
    return (
      <div className="flex items-center justify-center h-[60vh] text-muted-foreground">
        Dashboard data not found.
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 max-w-5xl mx-auto w-full space-y-6">
      {/* Welcome Banner */}
      <div className="bg-card border border-border rounded-xl p-5 md:p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <h1 className="font-semibold text-2xl tracking-tight text-foreground">
              Dashboard
            </h1>
            <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 inline-flex items-center gap-1">
              <ShieldCheck className="w-3 h-3" /> Verified Donor
            </span>
          </div>
          <p className="text-sm text-muted-foreground">
            Welcome back, {donor.fullName.split(' ')[0]}
          </p>
        </div>

        {/* Quick Identity Snippet */}
        <div className="hidden md:flex shrink-0 w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 items-center justify-center text-primary">
          <span className="font-bold text-lg">{donor.bloodGroup}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Status & Alerts */}
        <div className="space-y-6 lg:col-span-1">
          {/* SMS alerts banner */}
          <div className="bg-secondary/50 border border-border rounded-xl p-5 shadow-sm flex items-start gap-4">
            <div className="p-2 bg-primary/10 rounded-lg text-primary shrink-0 mt-0.5">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <div className="text-sm font-semibold text-foreground mb-1">
                SMS alerts are on
              </div>
              <div className="text-xs text-muted-foreground leading-relaxed">
                We will text you the moment{' '}
                <strong className="text-foreground">{donor.bloodGroup}</strong>{' '}
                blood is needed within a 10km radius of {donor.location}.
              </div>
            </div>
          </div>

          {/* Eligibility Card */}
          <div className="bg-card border border-border rounded-xl p-5 shadow-sm relative overflow-hidden">
            {/* Green accent line */}
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-emerald-500" />

            <h3 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-4 mt-1">
              Clinical Eligibility
            </h3>

            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <p className="text-lg font-semibold text-foreground">
                  Eligible to Donate
                </p>
                <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                  Clearance active
                </p>
              </div>
            </div>

            <p className="text-xs text-muted-foreground flex items-start gap-2 pt-4 border-t border-border">
              <Clock className="w-4 h-4 shrink-0" />
              <span>
                Your last donation was on 12 Mar 2026 — over 120 days ago.
              </span>
            </p>
          </div>
        </div>

        {/* Right Column: Nearby Requests */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">
              Nearby Active Emergencies
            </h2>
            <Link
              href="/donor/requests"
              className="text-xs font-medium text-primary hover:underline underline-offset-4"
            >
              View All
            </Link>
          </div>

          <div className="flex flex-col gap-3">
            {activeRequests.length === 0 ? (
              <div className="bg-card border border-border rounded-xl p-8 text-center text-muted-foreground shadow-sm">
                No active emergencies in your area right now.
              </div>
            ) : (
              activeRequests.map((request: RequestDetails) => (
                <Link
                  key={request.id}
                  href={`/donor/requests/${request.id}`}
                  className="group block bg-card border border-border rounded-xl p-4 md:p-5 hover:border-primary/50 hover:shadow-sm transition-all relative overflow-hidden"
                >
                  {/* Red accent bar for critical requests */}
                  {request.urgency === 'critical' && (
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-red-600" />
                  )}

                  <div className="flex items-center justify-between gap-4">
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-2 mb-1">
                        <UrgencyBadge level={request.urgency} />
                        <span className="text-xs font-mono text-muted-foreground uppercase tracking-wider hidden sm:inline-block">
                          {request.id}
                        </span>
                      </div>
                      <h3 className="font-medium text-foreground text-base group-hover:text-primary transition-colors">
                        {request.hospitalName}
                      </h3>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1 bg-secondary px-2 py-0.5 rounded text-foreground font-medium">
                          <Droplet className="w-3 h-3 text-primary" />{' '}
                          {request.bloodGroup}
                        </span>
                        <span className="flex items-center gap-1 hidden sm:flex">
                          <MapPin className="w-3 h-3" /> {request.distance} away
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" /> {request.timePosted}
                        </span>
                      </div>
                    </div>

                    <div className="shrink-0 flex flex-col items-end">
                      <div className="hidden sm:flex items-center text-xs font-medium text-muted-foreground group-hover:text-primary transition-colors">
                        Respond
                        <ChevronRight className="w-4 h-4 ml-1" />
                      </div>
                      {/* Mobile arrow */}
                      <ChevronRight className="w-5 h-5 text-muted-foreground sm:hidden" />
                    </div>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// --- Helper Component ---

function UrgencyBadge({ level }: { level?: string }) {
  if (level === 'critical') {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-red-100 text-red-700 text-[10px] font-bold uppercase tracking-widest border border-red-200">
        <AlertCircle className="w-3 h-3" /> Critical
      </span>
    );
  }
  if (level === 'high') {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-orange-100 text-orange-700 text-[10px] font-bold uppercase tracking-widest border border-orange-200">
        <Activity className="w-3 h-3" /> High
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-blue-100 text-blue-700 text-[10px] font-bold uppercase tracking-widest border border-blue-200">
      <Droplet className="w-3 h-3" /> Routine
    </span>
  );
}
