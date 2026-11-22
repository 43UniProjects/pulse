'use client';

import { useActionState, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import {
  AlertTriangle,
  Bell,
  CheckCircle2,
  ExternalLink,
  Loader2,
  Mail,
  MapPin,
  Radar,
} from 'lucide-react';
import { toast } from 'sonner';
import {
  createDonationRequest,
  type CreateDonationRequestState,
} from '@/actions/request.actions';
import { BLOOD_GROUPS } from '@/types/common.type';

const radii = [
  { label: '5 km', value: 5 },
  { label: '10 km', value: 10 },
  { label: '20 km', value: 20 },
] as const;

const INITIAL_STATE: CreateDonationRequestState = {
  success: false,
};

interface PostRequestClientProps {
  hospitalName?: string;
  hospitalLocationLabel?: string;
  isVerified?: boolean;
  verificationStatus?: string;
}

export default function PostRequestClient({
  hospitalName,
  hospitalLocationLabel,
  isVerified = true,
  verificationStatus = 'verified',
}: PostRequestClientProps) {
  const [radiusKm, setRadiusKm] = useState<number>(10);
  const [state, formAction, isPending] = useActionState(
    createDonationRequest,
    INITIAL_STATE,
  );
  const lastStateRef = useRef(state);

  useEffect(() => {
    if (state === lastStateRef.current) return;
    lastStateRef.current = state;

    if (state.success) {
      const matched = state.matchedCount ?? 0;
      if (matched > 0) {
        toast.success(
          `Request ${state.requestId ?? ''} broadcasted to ${matched} compatible donor${matched === 1 ? '' : 's'} within ${state.radiusKm ?? radiusKm} km.`,
        );
      } else {
        toast.warning(
          state.suggestExpandRadius
            ? `Request ${state.requestId ?? ''} posted with 0 nearby matches. Consider expanding the search radius to 20 km.`
            : `Request ${state.requestId ?? ''} posted with 0 nearby matches within ${state.radiusKm ?? radiusKm} km.`,
        );
      }
    } else if (state.error) {
      toast.error(state.error);
    }
  }, [state, radiusKm]);

  const matchedCount = state.matchedCount ?? 0;

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <div className="mb-6 glass rounded-xl border px-5 py-4 shadow-sm">
        <h1 className="font-display font-bold text-2xl text-foreground mb-1">
          Post Blood Request
        </h1>
        <p className="text-sm text-muted-foreground">
          Broadcast a request to eligible nearby donors
        </p>
        {(hospitalName || hospitalLocationLabel) && (
          <div className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground">
            <MapPin className="w-3.5 h-3.5 shrink-0 text-primary" />
            <span>
              Broadcasting from{' '}
              <strong className="text-foreground font-medium">
                {hospitalName || 'your facility'}
              </strong>
              {hospitalLocationLabel ? ` — ${hospitalLocationLabel}` : ''}
            </span>
          </div>
        )}
      </div>

      {state.success && matchedCount > 0 && (
        <div className="mb-6 bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-5 space-y-4">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
            <div className="space-y-1 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-sm font-semibold text-foreground">
                  Emergency Broadcast Dispatched
                </h2>
                {state.requestId && (
                  <span className="text-xs font-mono font-tabular px-2 py-0.5 rounded bg-background border border-border text-muted-foreground">
                    {state.requestId}
                  </span>
                )}
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Matched{' '}
                <strong className="text-foreground font-tabular">
                  {matchedCount}
                </strong>{' '}
                compatible eligible donor{matchedCount === 1 ? '' : 's'} for{' '}
                <strong className="text-foreground">{state.bloodGroup}</strong>{' '}
                within{' '}
                <strong className="text-foreground font-tabular">
                  {state.radiusKm} km
                </strong>
                .
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="bg-card border border-border rounded-lg px-3.5 py-2.5 flex items-center justify-between">
              <span className="inline-flex items-center gap-1.5 text-muted-foreground">
                <Bell className="w-3.5 h-3.5 text-primary" />
                Web Push Alerts
              </span>
              <span className="font-semibold text-foreground font-tabular">
                {state.pushSentCount ?? 0} / {state.pushAttemptedCount ?? 0}{' '}
                sent
              </span>
            </div>
            <div className="bg-card border border-border rounded-lg px-3.5 py-2.5 flex items-center justify-between">
              <span className="inline-flex items-center gap-1.5 text-muted-foreground">
                <Mail className="w-3.5 h-3.5 text-primary" />
                Email Alerts
              </span>
              <span className="font-semibold text-foreground font-tabular">
                {state.emailSentCount ?? 0} / {state.emailAttemptedCount ?? 0}{' '}
                sent
              </span>
            </div>
          </div>

          {(state.emailOptedOutCount ?? 0) > 0 && (
            <p className="text-xs text-muted-foreground">
              <span className="font-tabular font-medium text-foreground">
                {state.emailOptedOutCount}
              </span>{' '}
              matched donor{(state.emailOptedOutCount ?? 0) === 1 ? '' : 's'}{' '}
              currently have email notifications disabled in their profile.
            </p>
          )}

          <div className="flex flex-wrap items-center gap-3 pt-1">
            {state.requestObjectId && (
              <Link
                href={`/hospital/tracking/${state.requestObjectId}`}
                className="inline-flex items-center gap-1.5 bg-primary text-primary-foreground text-xs font-medium px-4 py-2 rounded-md hover:bg-primary/90 transition-colors"
              >
                Track Request
                <ExternalLink className="w-3.5 h-3.5" />
              </Link>
            )}
            <Link
              href="/hospital/dashboard"
              className="inline-flex items-center gap-1.5 bg-secondary text-secondary-foreground border border-border text-xs font-medium px-4 py-2 rounded-md hover:bg-secondary/80 transition-colors"
            >
              View Dashboard
            </Link>
          </div>
        </div>
      )}

      {state.success && matchedCount === 0 && (
        <div className="mb-6 bg-amber-500/10 border border-amber-500/30 rounded-xl p-5 space-y-3">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <div className="space-y-1 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-sm font-semibold text-foreground">
                  No Eligible Donors Matched Within{' '}
                  <span className="font-tabular">{state.radiusKm} km</span>
                </h2>
                {state.requestId && (
                  <span className="text-xs font-mono font-tabular px-2 py-0.5 rounded bg-background border border-border text-muted-foreground">
                    {state.requestId}
                  </span>
                )}
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Your request for{' '}
                <strong className="text-foreground">{state.bloodGroup}</strong>{' '}
                was saved with{' '}
                <strong className="text-foreground font-tabular">0</strong>{' '}
                matched donors.
                {state.suggestExpandRadius
                  ? ' Try expanding the search radius to 20 km and posting again to reach more eligible donors.'
                  : ' No compatible available donors were found within the maximum 20 km broadcast radius.'}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 pt-1">
            {state.suggestExpandRadius && (
              <button
                type="button"
                onClick={() => setRadiusKm(20)}
                className="inline-flex items-center gap-1.5 bg-primary text-primary-foreground text-xs font-medium px-4 py-2 rounded-md hover:bg-primary/90 transition-colors"
              >
                <Radar className="w-3.5 h-3.5" />
                Expand Radius to 20 km
              </button>
            )}
            {state.requestObjectId && (
              <Link
                href={`/hospital/tracking/${state.requestObjectId}`}
                className="inline-flex items-center gap-1.5 bg-secondary text-secondary-foreground border border-border text-xs font-medium px-4 py-2 rounded-md hover:bg-secondary/80 transition-colors"
              >
                Track Request
                <ExternalLink className="w-3.5 h-3.5" />
              </Link>
            )}
            <Link
              href="/hospital/dashboard"
              className="inline-flex items-center gap-1.5 bg-transparent border border-border text-foreground text-xs font-medium px-4 py-2 rounded-md hover:bg-secondary/50 transition-colors"
            >
              View Dashboard
            </Link>
          </div>
        </div>
      )}

      {!isVerified && (
        <div className="mb-6 bg-amber-500/10 border border-amber-500/30 rounded-xl p-4 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h3 className="text-sm font-semibold text-amber-600 dark:text-amber-400">
              Facility Verification Pending
            </h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Your facility account is currently{' '}
              <span className="font-semibold text-foreground uppercase">
                {verificationStatus}
              </span>
              . Emergency blood request broadcasts are restricted until an
              administrator verifies and approves your facility account.
            </p>
          </div>
        </div>
      )}

      {!state.success && state.error && (
        <div className="mb-6 bg-destructive/10 border border-destructive/30 rounded-xl p-4 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
          <p className="text-xs text-destructive font-medium">{state.error}</p>
        </div>
      )}

      <form
        action={formAction}
        className="bg-card border border-border rounded-lg p-6 flex flex-col gap-5"
      >
        <input type="hidden" name="radiusKm" value={radiusKm} />

        <div>
          <label className="text-xs font-medium text-foreground block mb-1">
            Blood Group Required
          </label>
          <select
            name="bloodGroup"
            required
            disabled={!isVerified || isPending}
            defaultValue=""
            className="w-full border border-border rounded px-3 py-2 text-sm outline-none focus:border-border transition-colors bg-background disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <option value="">Select blood group</option>
            {BLOOD_GROUPS.map((g) => (
              <option key={g} value={g}>
                {g}
              </option>
            ))}
          </select>
          {state.fieldErrors?.bloodGroup && (
            <p className="text-xs text-destructive mt-1">
              {state.fieldErrors.bloodGroup[0]}
            </p>
          )}
        </div>

        <div>
          <label className="text-xs font-medium text-foreground block mb-1">
            Quantity (units)
          </label>
          <input
            type="number"
            name="quantity"
            min={1}
            max={20}
            defaultValue={1}
            required
            disabled={!isVerified || isPending}
            className="w-full border border-border rounded px-3 py-2 text-sm outline-none focus:border-border transition-colors bg-background font-tabular disabled:opacity-50 disabled:cursor-not-allowed"
          />
          {state.fieldErrors?.quantity && (
            <p className="text-xs text-destructive mt-1">
              {state.fieldErrors.quantity[0]}
            </p>
          )}
        </div>

        <div>
          <label className="text-xs font-medium text-foreground block mb-2">
            Search Radius
          </label>
          <div className="flex gap-2">
            {radii.map((r) => (
              <button
                key={r.value}
                type="button"
                disabled={!isVerified || isPending}
                onClick={() => setRadiusKm(r.value)}
                className={`flex-1 text-sm font-medium py-2 rounded border transition-colors font-tabular disabled:opacity-50 disabled:cursor-not-allowed ${
                  radiusKm === r.value
                    ? 'bg-red-600 text-white border-red-600'
                    : 'bg-transparent text-muted-foreground border-border hover:bg-muted/50'
                }`}
              >
                {r.label}
              </button>
            ))}
          </div>
          {state.fieldErrors?.radiusKm && (
            <p className="text-xs text-destructive mt-1">
              {state.fieldErrors.radiusKm[0]}
            </p>
          )}
        </div>

        <div>
          <label className="text-xs font-medium text-foreground block mb-1">
            Urgency Level
          </label>
          <select
            name="urgency"
            required
            disabled={!isVerified || isPending}
            defaultValue="critical"
            className="w-full border border-border rounded px-3 py-2 text-sm outline-none focus:border-border transition-colors bg-background disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="normal">Normal</option>
          </select>
          {state.fieldErrors?.urgency && (
            <p className="text-xs text-destructive mt-1">
              {state.fieldErrors.urgency[0]}
            </p>
          )}
        </div>

        <div>
          <label className="text-xs font-medium text-foreground block mb-1">
            Additional Notes
          </label>
          <textarea
            name="notes"
            rows={3}
            disabled={!isVerified || isPending}
            placeholder="Any specific instructions or context for the donor..."
            className="w-full border border-border rounded px-3 py-2 text-sm outline-none focus:border-border transition-colors resize-none bg-background disabled:opacity-50 disabled:cursor-not-allowed"
          />
          {state.fieldErrors?.notes && (
            <p className="text-xs text-destructive mt-1">
              {state.fieldErrors.notes[0]}
            </p>
          )}
        </div>

        <div className="flex items-center gap-3 pt-1">
          <button
            type="submit"
            disabled={!isVerified || isPending}
            className="inline-flex items-center gap-2 bg-red-600 text-white font-medium text-sm px-5 py-2 rounded hover:bg-red-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed shadow-sm hover:shadow-md cursor-pointer"
          >
            {isPending && <Loader2 className="w-4 h-4 animate-spin" />}
            {isPending
              ? 'Broadcasting...'
              : !isVerified
                ? 'Verification Required'
                : 'Post Request'}
          </button>
        </div>
      </form>
    </div>
  );
}
