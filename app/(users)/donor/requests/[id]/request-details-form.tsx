'use client';

import { useState, useEffect, useTransition } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { MapPin, Navigation, Phone, CheckCircle2, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import {
  acceptDonationRequest,
  declineDonationRequest,
} from '@/actions/fulfillment.actions';

export interface SerializedRequestData {
  _id: string;
  requestId: string;
  hospitalName: string;
  hospitalAddress: string;
  hospitalHotline: string;
  hospitalCoords: {
    lat: number;
    lng: number;
  };
  bloodGroup: string;
  quantity: number;
  urgency: string;
  status: string;
  radiusKm: number;
  notes: string;
  distance: string;
  createdAt: string;
}

interface RequestDetailClientProps {
  request: SerializedRequestData;
  initialResponseStatus: string;
}

export default function RequestDetailClient({
  request,
  initialResponseStatus,
}: RequestDetailClientProps) {
  const router = useRouter();
  const [overrideStatus, setOverrideStatus] = useState<string | null>(null);
  const [prevInitial, setPrevInitial] = useState(initialResponseStatus);
  const [isPending, startTransition] = useTransition();

  // Reset local override when Server Component sends new database status
  if (initialResponseStatus !== prevInitial) {
    setPrevInitial(initialResponseStatus);
    setOverrideStatus(null);
  }

  const responseStatus = overrideStatus || initialResponseStatus;

  // Smart background polling for real-time state updates
  useEffect(() => {
    if (responseStatus === 'completed' || responseStatus === 'declined') {
      return;
    }

    const interval = setInterval(() => {
      router.refresh();
    }, 6000);

    return () => clearInterval(interval);
  }, [router, responseStatus]);

  const urgencyStyles: Record<string, string> = {
    critical:
      'bg-red-500/15 text-red-600 dark:text-red-400 border border-red-500/30',
    high: 'bg-orange-500/15 text-orange-600 dark:text-orange-400 border border-orange-500/30',
    normal: 'bg-secondary text-secondary-foreground border border-border',
  };

  const mapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${request.hospitalCoords.lat},${request.hospitalCoords.lng}`;

  const handleAccept = () => {
    startTransition(async () => {
      const res = await acceptDonationRequest(request.requestId || request._id);
      if (res.success) {
        setOverrideStatus('accepted');
        toast.success(
          'Donation request accepted! The hospital has been notified of your response.',
        );
      } else {
        toast.error(res.error || 'Failed to accept request.');
      }
    });
  };

  const handleDecline = () => {
    startTransition(async () => {
      const res = await declineDonationRequest(
        request.requestId || request._id,
      );
      if (res.success) {
        setOverrideStatus('declined');
        toast.info('You have declined this emergency request.');
      } else {
        toast.error(res.error || 'Failed to decline request.');
      }
    });
  };

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto font-sans space-y-6">
      {/* Commitment Banner when Accepted */}
      {responseStatus === 'accepted' && (
        <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-emerald-800 dark:text-emerald-300 text-sm">
                Commitment Confirmed — Hospital Awaiting Arrival
              </h3>
              <p className="text-xs text-emerald-700/80 dark:text-emerald-400/80 mt-0.5">
                Thank you for responding. Please report to the hospital blood
                transfusion unit promptly.
              </p>
            </div>
          </div>
          <a
            href={mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold px-4 py-2.5 rounded-lg transition-colors shrink-0 shadow-sm"
          >
            <Navigation className="w-4 h-4" />
            Open Directions
          </a>
        </div>
      )}

      {/* Completed Banner */}
      {responseStatus === 'completed' && (
        <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-5 flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0" />
          <div>
            <h3 className="font-semibold text-blue-800 dark:text-blue-300 text-sm">
              Donation Fulfilled & Recorded
            </h3>
            <p className="text-xs text-blue-700/80 dark:text-blue-400/80 mt-0.5">
              Blood collection was successfully completed. Thank you for saving
              a life!
            </p>
          </div>
        </div>
      )}

      {/* Main Clinical Request Card */}
      <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
        {/* Header */}
        <div className="p-6 border-b border-border flex flex-col sm:flex-row sm:items-start justify-between gap-4 bg-card">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-mono font-medium text-muted-foreground uppercase tracking-widest font-tabular">
                #{request.requestId}
              </span>
              <span
                className={`text-xs font-medium px-2.5 py-0.5 rounded-full capitalize ${
                  urgencyStyles[request.urgency] || urgencyStyles.normal
                }`}
              >
                {request.urgency} Urgency
              </span>
            </div>
            <h1 className="font-semibold text-2xl text-card-foreground">
              {request.hospitalName}
            </h1>
            <p className="text-sm text-muted-foreground mt-0.5 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 shrink-0" />
              {request.hospitalAddress}
            </p>
          </div>

          <div className="flex items-center gap-2">
            {responseStatus !== 'completed' &&
              responseStatus !== 'declined' && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                  </span>
                  <span>Live Sync Active</span>
                </span>
              )}
            <span
              className={`text-xs font-semibold px-3 py-1 rounded-md uppercase tracking-wider ${
                responseStatus === 'accepted'
                  ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                  : responseStatus === 'declined'
                    ? 'bg-destructive/15 text-destructive border border-destructive/30'
                    : responseStatus === 'completed'
                      ? 'bg-blue-500/15 text-blue-600 dark:text-blue-400 border border-blue-500/30'
                      : 'bg-secondary text-secondary-foreground border border-border'
              }`}
            >
              Status: {responseStatus}
            </span>
          </div>
        </div>

        {/* Proximity & Navigation Bar */}
        <div className="bg-muted/40 px-6 py-4 border-b border-border flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                <Navigation className="w-4 h-4" />
              </div>
              <div>
                <div className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
                  Proximity
                </div>
                <div className="text-sm font-semibold text-foreground font-tabular">
                  {request.distance} away
                </div>
              </div>
            </div>

            {request.hospitalHotline && (
              <div className="flex items-center gap-2 border-l border-border pl-6">
                <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center text-foreground">
                  <Phone className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
                    Emergency Hotline
                  </div>
                  <a
                    href={`tel:${request.hospitalHotline}`}
                    className="text-sm font-semibold text-primary hover:underline font-tabular"
                  >
                    {request.hospitalHotline}
                  </a>
                </div>
              </div>
            )}
          </div>

          <a
            href={mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-xs font-medium bg-background border border-border hover:bg-secondary px-3.5 py-2 rounded-lg transition-colors shadow-sm text-foreground"
          >
            <MapPin className="w-3.5 h-3.5 text-primary" />
            View on Google Maps
          </a>
        </div>

        {/* Clinical Parameters Grid */}
        <div className="p-6 grid grid-cols-2 md:grid-cols-4 gap-6 bg-card">
          <div className="bg-secondary/30 p-4 rounded-xl border border-border">
            <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">
              Blood Group
            </div>
            <div className="font-bold text-3xl text-foreground font-tabular">
              {request.bloodGroup}
            </div>
            <div className="text-[11px] text-muted-foreground mt-1">
              Required Match
            </div>
          </div>

          <div className="bg-secondary/30 p-4 rounded-xl border border-border">
            <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">
              Quantity Needed
            </div>
            <div className="font-bold text-3xl text-foreground font-tabular">
              {request.quantity}{' '}
              <span className="text-sm font-normal text-muted-foreground">
                Unit{request.quantity !== 1 ? 's' : ''}
              </span>
            </div>
            <div className="text-[11px] text-muted-foreground mt-1">
              Whole Blood
            </div>
          </div>

          <div className="bg-secondary/30 p-4 rounded-xl border border-border">
            <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">
              Search Radius
            </div>
            <div className="font-bold text-3xl text-foreground font-tabular">
              {request.radiusKm}{' '}
              <span className="text-sm font-normal text-muted-foreground">
                km
              </span>
            </div>
            <div className="text-[11px] text-muted-foreground mt-1">
              Broadcast Limit
            </div>
          </div>

          <div className="bg-secondary/30 p-4 rounded-xl border border-border">
            <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">
              Posted At
            </div>
            <div className="font-semibold text-sm text-foreground font-tabular mt-2">
              {new Intl.DateTimeFormat('en-GB', {
                day: '2-digit',
                month: 'short',
                hour: '2-digit',
                minute: '2-digit',
              }).format(new Date(request.createdAt))}
            </div>
            <div className="text-[11px] text-muted-foreground mt-1">
              Emergency Broadcast
            </div>
          </div>

          {/* Clinical Instructions */}
          <div className="col-span-2 md:col-span-4 border-t border-border pt-5">
            <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
              Clinical Instructions & Patient Notes
            </div>
            <div className="text-sm text-card-foreground leading-relaxed bg-muted/30 p-4 rounded-lg border border-border/60">
              {request.notes ||
                'Urgent transfusion required. Eligible matching donors are requested to report immediately.'}
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="px-6 py-4 border-t border-border bg-muted/20 flex flex-col sm:flex-row items-center justify-between gap-4">
          <Link
            href="/donor/dashboard"
            className="text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            &larr; Back to Dashboard
          </Link>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            {responseStatus === 'pending' && (
              <>
                <button
                  type="button"
                  disabled={isPending}
                  onClick={handleDecline}
                  className="flex-1 sm:flex-initial text-xs font-semibold px-5 py-2.5 rounded-lg border border-border text-foreground hover:bg-secondary transition-colors disabled:opacity-50"
                >
                  {isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin mx-auto" />
                  ) : (
                    'Decline'
                  )}
                </button>

                <button
                  type="button"
                  disabled={isPending}
                  onClick={handleAccept}
                  className="flex-1 sm:flex-initial text-xs font-semibold px-6 py-2.5 rounded-lg bg-primary hover:bg-red-700 text-primary-foreground transition-colors shadow-sm disabled:opacity-50 flex items-center justify-center gap-1.5"
                >
                  {isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Accepting...
                    </>
                  ) : (
                    'Accept Request'
                  )}
                </button>
              </>
            )}

            {responseStatus === 'accepted' && (
              <div className="text-xs text-muted-foreground flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                Response registered. Hospital tracking is active.
              </div>
            )}

            {responseStatus === 'declined' && (
              <div className="text-xs text-muted-foreground">
                You declined this request.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
