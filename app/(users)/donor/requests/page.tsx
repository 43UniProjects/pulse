'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Activity,
  MapPin,
  Clock,
  ChevronRight,
  Droplet,
  AlertCircle,
  FileBox,
} from 'lucide-react';
import { getDonationRequests, getDonationHistory } from './data';
import {
  DonationRequestEntity,
  REQUEST_URGENCY_LEVEL,
} from '@/types/donor-request.type';
import { DonationEntity } from '@/types/donation.type';

export default function DonorRequestsPage() {
  // UI State for toggling between active requests and history
  const [tab, setTab] = useState<'active' | 'history'>('active');

  // Fetch data for mock donor ID "donor_1"
  const activeRequests = Object.values(getDonationRequests());
  const historyRequests = getDonationHistory('donor_1');

  return (
    <div className="max-w-4xl mx-auto w-full space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-border pb-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            Emergency Requests
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage nearby active emergencies and view your past donations.
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm font-mono text-muted-foreground">
          <MapPin className="w-4 h-4" />
          <span>RADIUS: 10 KM</span>
        </div>
      </div>

      {/* Tab Selector */}
      <div className="flex p-1 gap-1 bg-secondary border border-border rounded-lg max-w-sm">
        <button
          type="button"
          onClick={() => setTab('active')}
          className={`flex-1 text-xs font-medium py-2 rounded-md transition-all uppercase tracking-wider ${
            tab === 'active'
              ? 'bg-background text-foreground shadow-sm border border-border/50'
              : 'text-muted-foreground hover:text-foreground hover:bg-background/50 border border-transparent'
          }`}
        >
          Active Requests
          {activeRequests.length > 0 && (
            <span className="ml-2 inline-flex items-center justify-center bg-primary/10 text-primary px-1.5 py-0.5 rounded-full text-[10px]">
              {activeRequests.length}
            </span>
          )}
        </button>
        <button
          type="button"
          onClick={() => setTab('history')}
          className={`flex-1 text-xs font-medium py-2 rounded-md transition-all uppercase tracking-wider ${
            tab === 'history'
              ? 'bg-background text-foreground shadow-sm border border-border/50'
              : 'text-muted-foreground hover:text-foreground hover:bg-background/50 border border-transparent'
          }`}
        >
          Donation History
        </button>
      </div>

      {/* Requests List */}
      <div className="flex flex-col gap-3">
        {tab === 'active' ? (
          activeRequests.length === 0 ? (
            <EmptyState message="No active blood requests in your area." />
          ) : (
            activeRequests.map((request: DonationRequestEntity) => (
              <Link
                key={request._id}
                href={`/donor/requests/${request._id}`}
                className="group block bg-card border border-border rounded-xl p-4 md:p-5 hover:border-primary/50 hover:shadow-sm transition-all relative overflow-hidden"
              >
                {request.urgency === REQUEST_URGENCY_LEVEL[0] && (
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-red-600" />
                )}

                <div className="flex flex-col md:flex-row md:items-center gap-4 md:gap-6">
                  <div className="hidden md:flex shrink-0 w-12 h-12 rounded-full bg-secondary border border-border items-center justify-center">
                    <span className="font-bold text-foreground">
                      {request.bloodGroup}
                    </span>
                  </div>

                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2 mb-1">
                      <UrgencyBadge level={request.urgency} />
                      <span className="text-xs font-mono text-muted-foreground uppercase tracking-wider">
                        {request._id}
                      </span>
                    </div>
                    <h3 className="font-medium text-foreground text-lg group-hover:text-primary transition-colors">
                      {request.hospitalName}
                    </h3>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5" />
                        {request.distance || 'Nearby'}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5" />
                        {request.timePosted || 'Recent'}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between md:flex-col md:items-end gap-3 md:gap-2 shrink-0 border-t border-border md:border-t-0 pt-3 md:pt-0 mt-3 md:mt-0">
                    <StatusBadge status={request.status} />
                    <div className="flex items-center text-xs font-medium text-primary md:opacity-0 group-hover:opacity-100 transition-opacity">
                      View Details
                      <ChevronRight className="w-4 h-4 ml-1" />
                    </div>
                  </div>
                </div>
              </Link>
            ))
          )
        ) : historyRequests.length === 0 ? (
          <EmptyState message="No requests found in your history." />
        ) : (
          historyRequests.map((donation: DonationEntity) => (
            <div
              key={donation._id}
              className="group block bg-card border border-border rounded-xl p-4 md:p-5 hover:border-primary/50 hover:shadow-sm transition-all relative overflow-hidden"
            >
              <div className="flex flex-col md:flex-row md:items-center gap-4 md:gap-6">
                <div className="hidden md:flex shrink-0 w-12 h-12 rounded-full bg-secondary border border-border items-center justify-center">
                  <span className="font-bold text-foreground">
                    {donation.bloodGroup}
                  </span>
                </div>

                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-[10px] font-bold uppercase tracking-widest border border-green-200 dark:border-green-900/50">
                      Physical Donation
                    </span>
                    <span className="text-xs font-mono text-muted-foreground uppercase tracking-wider">
                      {donation.donationId}
                    </span>
                  </div>
                  <h3 className="font-medium text-foreground text-lg transition-colors">
                    Donation Completed
                  </h3>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5" />
                      {new Date(donation.donationDate).toLocaleDateString()}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Droplet className="w-3.5 h-3.5" />
                      {donation.units} Unit(s)
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between md:flex-col md:items-end gap-3 md:gap-2 shrink-0 border-t border-border md:border-t-0 pt-3 md:pt-0 mt-3 md:mt-0">
                  <StatusBadge status={donation.status} />
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

// --- Helper Components ---

function EmptyState({ message }: { message: string }) {
  return (
    <div className="text-center py-12 bg-card border border-border rounded-xl">
      <FileBox className="w-10 h-10 text-muted-foreground mx-auto mb-3 opacity-50" />
      <p className="text-muted-foreground text-sm">{message}</p>
    </div>
  );
}

function UrgencyBadge({ level }: { level?: string }) {
  if (level === REQUEST_URGENCY_LEVEL[0]) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 text-[10px] font-bold uppercase tracking-widest border border-red-200 dark:border-red-900/50">
        <AlertCircle className="w-3 h-3" /> Critical
      </span>
    );
  }
  if (level === REQUEST_URGENCY_LEVEL[1]) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 text-[10px] font-bold uppercase tracking-widest border border-orange-200 dark:border-orange-900/50">
        <Activity className="w-3 h-3" /> High
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-[10px] font-bold uppercase tracking-widest border border-blue-200 dark:border-blue-900/50">
      <Droplet className="w-3 h-3" /> Routine
    </span>
  );
}

function StatusBadge({ status }: { status?: string }) {
  const safeStatus = (status || 'pending').toLowerCase();

  const styles: Record<string, string> = {
    pending:
      'bg-yellow-100/50 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 border-yellow-200 dark:border-yellow-900/50',
    accepted: 'bg-primary/10 text-primary border-primary/20',
    completed:
      'bg-green-100/50 dark:bg-green-900/30 text-green-700 dark:text-green-400 border-green-200 dark:border-green-900/50',
    declined: 'bg-secondary text-muted-foreground border-border',
  };

  const style = styles[safeStatus] || styles.pending;

  return (
    <span
      className={`px-2.5 py-1 rounded-md text-xs font-semibold capitalize border ${style}`}
    >
      {safeStatus}
    </span>
  );
}
