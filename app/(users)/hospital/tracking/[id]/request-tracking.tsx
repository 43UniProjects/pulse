'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Droplet,
  CheckCircle2,
  Clock,
  Phone,
  Barcode,
  ArrowLeft,
  ShieldCheck,
} from 'lucide-react';
import BloodIntakeModal from '@/components/hospital/blood-intake-modal';

export interface TrackingDetailDonor {
  donationId: string;
  donorId: string;
  name: string;
  bloodGroup: string;
  distance: string;
  status: 'Accepted' | 'Completed' | 'Declined' | 'Pending';
  phone: string;
  verified: boolean;
  units: number;
  batchNumber?: string;
}

export interface TrackingDetailRequest {
  _id: string;
  requestId?: string;
  bloodGroup: string;
  quantity: number;
  radiusKm: number;
  urgency: string;
  status: string;
}

const statusBadgeStyles: Record<string, string> = {
  Accepted:
    'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30',
  Completed:
    'bg-blue-500/15 text-blue-600 dark:text-blue-400 border border-blue-500/30',
  Declined: 'bg-destructive/15 text-destructive border border-destructive/30',
  Pending: 'bg-secondary text-secondary-foreground border border-border',
};

export default function RequestTrackingClient({
  id,
  requestData,
  initialDonors = [],
}: {
  id: string;
  requestData?: TrackingDetailRequest | null;
  initialDonors?: TrackingDetailDonor[];
}) {
  const router = useRouter();
  const [selectedDonorForIntake, setSelectedDonorForIntake] =
    useState<TrackingDetailDonor | null>(null);

  useEffect(() => {
    // Pause background polling if request is already fully completed or modal dialog is open
    if (
      requestData?.status === 'completed' ||
      Boolean(selectedDonorForIntake)
    ) {
      return;
    }

    const interval = setInterval(() => {
      router.refresh();
    }, 6000);

    return () => clearInterval(interval);
  }, [router, requestData?.status, selectedDonorForIntake]);

  if (!requestData) {
    return (
      <div className="p-8 max-w-5xl mx-auto text-center text-muted-foreground">
        Emergency blood request record not found.
      </div>
    );
  }

  const donors = initialDonors;
  const acceptedDonors = donors.filter((d) => d.status === 'Accepted');
  const completedDonors = donors.filter((d) => d.status === 'Completed');

  const needed = requestData.quantity || 1;
  const fulfilledUnits = completedDonors.reduce(
    (acc, d) => acc + (d.units || 1),
    0,
  );
  const pct = Math.round((fulfilledUnits / needed) * 100);

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto space-y-6">
      {/* Back button & Breadcrumb */}
      <div className="flex items-center justify-between">
        <Link
          href="/hospital/dashboard"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Hospital Dashboard
        </Link>
        <span className="text-xs font-mono font-medium text-muted-foreground uppercase tracking-widest font-tabular">
          #{requestData.requestId || id}
        </span>
      </div>

      {/* Header Banner */}
      <div className="bg-card border border-border rounded-xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full capitalize bg-primary/10 text-primary border border-primary/20">
              {requestData.urgency} Urgency
            </span>
            <span
              className={`text-xs font-medium px-2.5 py-0.5 rounded-full capitalize ${
                requestData.status === 'completed'
                  ? 'bg-blue-500/15 text-blue-600 dark:text-blue-400'
                  : 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
              }`}
            >
              {requestData.status}
            </span>
          </div>
          <h1 className="font-bold text-2xl text-foreground">
            Emergency Blood Request Tracking
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Monitor incoming responding donors in real time and record clinical
            blood collections.
          </p>
        </div>

        <div className="flex items-center gap-4 border-t md:border-t-0 md:border-l border-border pt-4 md:pt-0 md:pl-6">
          <div>
            <div className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
              Required Match
            </div>
            <div className="font-extrabold text-3xl text-primary font-tabular">
              {requestData.bloodGroup}
            </div>
          </div>
          <div className="border-l border-border pl-4">
            <div className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
              Target Quota
            </div>
            <div className="font-extrabold text-3xl text-foreground font-tabular">
              {requestData.quantity}{' '}
              <span className="text-sm font-normal text-muted-foreground">
                Unit{requestData.quantity !== 1 ? 's' : ''}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Progress & Overview Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Metric 1: Fulfillment Bar */}
        <div className="md:col-span-2 bg-card border border-border rounded-xl p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-foreground">
              Fulfillment Progress
            </span>
            <span
              className={`text-xs font-semibold px-2.5 py-0.5 rounded-full font-tabular ${
                pct >= 100
                  ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                  : 'bg-orange-500/15 text-orange-600 dark:text-orange-400 border border-orange-500/30'
              }`}
            >
              {pct >= 100 ? 'Fully Fulfilled' : `${pct}% Fulfilled`}
            </span>
          </div>

          <div className="h-2.5 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-all duration-700"
              style={{ width: `${Math.min(pct, 100)}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-xs text-muted-foreground font-tabular">
            <span>
              <strong>{fulfilledUnits}</strong> of {needed} units collected
            </span>
            <span>
              {acceptedDonors.length} donor
              {acceptedDonors.length !== 1 ? 's' : ''} en route / accepted
            </span>
          </div>
        </div>

        {/* Metric 2: Radius Info */}
        <div className="bg-card border border-border rounded-xl p-5 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
              Broadcast Radius
            </div>
            <div className="font-bold text-2xl text-foreground font-tabular">
              {requestData.radiusKm} km
            </div>
            <div className="text-[11px] text-muted-foreground mt-0.5">
              Geospatial 2dsphere filter
            </div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
            <Clock className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Responding Donors Table */}
      <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
        <div className="px-6 py-4 border-b border-border flex items-center justify-between bg-card">
          <div className="flex items-center gap-2">
            <h2 className="font-semibold text-sm text-foreground uppercase tracking-wider">
              Responding Donors
            </h2>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground font-tabular">
              {donors.length}
            </span>
          </div>
          <span className="text-xs text-muted-foreground font-tabular">
            Sorted by most recent response
          </span>
        </div>

        {donors.length === 0 ? (
          <div className="p-12 text-center text-muted-foreground space-y-2">
            <Droplet className="w-8 h-8 mx-auto text-muted-foreground/40" />
            <p className="text-sm font-medium">
              No donors have responded to this emergency request yet.
            </p>
            <p className="text-xs text-muted-foreground/80 max-w-md mx-auto">
              Notified donors matching {requestData.bloodGroup} within{' '}
              {requestData.radiusKm} km will appear here as soon as they accept.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left bg-muted/40">
                  <th className="px-6 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Donor
                  </th>
                  <th className="px-6 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Proximity
                  </th>
                  <th className="px-6 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-6 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider text-right">
                    Clinical Action
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {donors.map((d, idx) => (
                  <tr
                    key={d.donationId || d.donorId + idx}
                    className="hover:bg-muted/30 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 font-semibold text-foreground">
                        <span>{d.name}</span>
                        <span className="text-xs font-bold text-primary font-tabular">
                          ({d.bloodGroup})
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-0.5">
                        {d.verified ? (
                          <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium">
                            <ShieldCheck className="w-3.5 h-3.5" />
                            Health Verified
                          </span>
                        ) : (
                          <span>Donor Profile Active</span>
                        )}
                      </div>
                    </td>

                    <td className="px-6 py-4 text-foreground font-tabular text-sm">
                      {d.distance}
                    </td>

                    <td className="px-6 py-4">
                      <span
                        className={`text-xs font-semibold px-2.5 py-1 rounded-md capitalize inline-flex items-center gap-1 ${
                          statusBadgeStyles[d.status] ||
                          statusBadgeStyles.Pending
                        }`}
                      >
                        {d.status === 'Completed' && (
                          <CheckCircle2 className="w-3 h-3" />
                        )}
                        {d.status}
                      </span>
                    </td>

                    <td className="px-6 py-4">
                      {d.phone ? (
                        <a
                          href={`tel:${d.phone}`}
                          className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline font-tabular"
                        >
                          <Phone className="w-3.5 h-3.5" />
                          {d.phone}
                        </a>
                      ) : (
                        <span className="text-xs text-muted-foreground">
                          Pending
                        </span>
                      )}
                    </td>

                    <td className="px-6 py-4 text-right">
                      {d.status === 'Accepted' && (
                        <button
                          type="button"
                          onClick={() => setSelectedDonorForIntake(d)}
                          className="inline-flex items-center gap-1.5 bg-primary hover:bg-red-700 text-primary-foreground text-xs font-semibold px-3.5 py-2 rounded-lg transition-colors shadow-sm cursor-pointer"
                        >
                          <Droplet className="w-3.5 h-3.5" />
                          Record Blood Collection
                        </button>
                      )}

                      {d.status === 'Completed' && (
                        <div className="text-right">
                          <span className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 dark:text-blue-400">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Collection Recorded
                          </span>
                          {d.batchNumber && (
                            <div className="text-[11px] text-muted-foreground font-tabular flex items-center justify-end gap-1 mt-0.5">
                              <Barcode className="w-3 h-3" />
                              {d.batchNumber}
                            </div>
                          )}
                        </div>
                      )}

                      {d.status === 'Declined' && (
                        <span className="text-xs text-muted-foreground">
                          Declined by Donor
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Clinical Intake Modal Dialog */}
      {selectedDonorForIntake && (
        <BloodIntakeModal
          isOpen={Boolean(selectedDonorForIntake)}
          onClose={() => setSelectedDonorForIntake(null)}
          donationId={selectedDonorForIntake.donationId}
          donorName={selectedDonorForIntake.name}
          donorBloodGroup={
            selectedDonorForIntake.bloodGroup || requestData.bloodGroup
          }
          onSuccess={() => {
            setSelectedDonorForIntake(null);
            router.refresh();
          }}
        />
      )}
    </div>
  );
}
