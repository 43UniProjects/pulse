import { Metadata } from 'next';
import {
  User,
  MapPin,
  Droplet,
  ShieldCheck,
  Clock,
  Activity,
  Phone,
  Mail,
  Edit3,
} from 'lucide-react';
import { getDonor, getDonationHistory } from '../requests/data';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'My Profile | Pulse',
  description: 'Manage your donor profile and availability.',
};

export default async function DonorProfilePage() {
  // In a real app, you would get the ID from the session/JWT cookie
  const donorId = '1';
  const donor = getDonor(donorId);
  const history = Object.values(getDonationHistory(donorId));

  // Calculate stats based on history
  const completedDonations = history.filter(
    (req) => req.status === 'completed',
  ).length;

  if (!donor) {
    return (
      <div className="flex items-center justify-center h-[60vh] text-muted-foreground">
        Profile data not found.
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto w-full space-y-6 animate-in fade-in duration-500">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-border pb-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            Donor Profile
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage your personal information and clinical eligibility.
          </p>
        </div>
        <button className="inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium bg-secondary text-secondary-foreground border border-border rounded-md hover:bg-secondary/80 transition-colors">
          <Edit3 className="w-4 h-4" />
          <Link href={'/donor/profile/settings'}>Profile Settings</Link>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Identity Card (Spans 2 columns on large screens) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-card border border-border rounded-xl p-6 shadow-sm flex flex-col sm:flex-row items-center sm:items-start gap-6">
            {/* Blood Group Avatar */}
            <div className="shrink-0 w-24 h-24 rounded-2xl bg-primary/10 border border-primary/20 flex flex-col items-center justify-center text-primary">
              <Droplet className="w-6 h-6 mb-1 opacity-80" />
              <span className="text-2xl font-bold">{donor.bloodGroup}</span>
            </div>

            {/* Core Info */}
            <div className="flex-1 text-center sm:text-left space-y-1">
              <h2 className="text-2xl font-semibold text-foreground">
                {donor.fullName}
              </h2>
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-sm text-muted-foreground mt-2">
                <span className="flex items-center justify-center sm:justify-start gap-1.5">
                  <User className="w-4 h-4" /> ID: PLS-
                  {donor.id.padStart(4, '0')}
                </span>
                <span className="hidden sm:inline">•</span>
                <span className="flex items-center justify-center sm:justify-start gap-1.5">
                  <MapPin className="w-4 h-4" /> {donor.location}
                </span>
              </div>
            </div>
          </div>

          {/* Contact & Demographics */}
          <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
            <h3 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground mb-4">
              Contact & Registration
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-1">
                  Email Address
                </p>
                <p className="text-sm font-medium text-foreground flex items-center gap-2">
                  <Mail className="w-4 h-4 text-muted-foreground" />
                  {/* Mocking email since it wasn't in our minimal Donor interface */}
                  {donor.fullName.split(' ')[0].toLowerCase()}@example.com
                </p>
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-1">
                  Phone (SMS Alerts)
                </p>
                <p className="text-sm font-medium text-foreground flex items-center gap-2">
                  <Phone className="w-4 h-4 text-muted-foreground" />
                  +94 77 123 4567
                </p>
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-1">
                  Date of Birth
                </p>
                <p className="text-sm font-medium text-foreground">
                  14 May 1995 (29 years)
                </p>
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-1">
                  Account Status
                </p>
                <p className="text-sm font-medium text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4" />
                  Verified
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar: Clinical Eligibility & Stats */}
        <div className="space-y-6">
          {/* Eligibility Card */}
          <div className="bg-card border border-border rounded-xl p-6 shadow-sm relative overflow-hidden">
            {/* Green accent line */}
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-emerald-500" />

            <h3 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground mb-4 mt-1">
              Clinical Status
            </h3>

            <div className="flex items-center gap-3 mb-4">
              <div className="p-2.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
                <Activity className="w-5 h-5" />
              </div>
              <div>
                <p className="text-lg font-semibold text-foreground">
                  Eligible to Donate
                </p>
                <p className="text-xs text-muted-foreground">
                  4-month waiting period cleared
                </p>
              </div>
            </div>

            <div className="bg-secondary/50 rounded-lg p-3 border border-border">
              <p className="text-xs text-muted-foreground flex items-start gap-2">
                <Clock className="w-4 h-4 shrink-0 text-primary" />
                <span>
                  You will automatically be excluded from emergency pings for
                  120 days following a completed donation.
                </span>
              </p>
            </div>
          </div>

          {/* Stats Card */}
          <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
            <h3 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground mb-4">
              Impact Overview
            </h3>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-lg border border-border bg-background">
                <span className="text-sm font-medium text-muted-foreground">
                  Total Donations
                </span>
                <span className="text-xl font-bold text-foreground font-tabular">
                  {completedDonations}
                </span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg border border-border bg-background">
                <span className="text-sm font-medium text-muted-foreground">
                  Emergencies Responded
                </span>
                <span className="text-xl font-bold text-foreground font-tabular">
                  {history.length}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
