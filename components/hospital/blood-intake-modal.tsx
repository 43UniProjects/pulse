'use client';

import { useState, useTransition } from 'react';
import { Dialog } from '@base-ui/react/dialog';
import {
  Activity,
  AlertCircle,
  Barcode,
  CheckCircle2,
  Droplet,
  Loader2,
  ShieldCheck,
  X,
} from 'lucide-react';
import { toast } from 'sonner';
import {
  completeBloodDonation,
  BloodIntakePayload,
} from '@/actions/fulfillment.actions';
import { ScreeningStatus } from '@/types/donation.type';

export interface BloodIntakeModalProps {
  donationId: string;
  donorName: string;
  donorBloodGroup: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function BloodIntakeModal({
  donationId,
  donorName,
  donorBloodGroup,
  isOpen,
  onClose,
  onSuccess,
}: BloodIntakeModalProps) {
  const [isPending, startTransition] = useTransition();

  // Form State
  const [units, setUnits] = useState<number>(1);
  const [batchNumber, setBatchNumber] = useState<string>('');
  const [hemoglobinLevel, setHemoglobinLevel] = useState<string>('13.5');
  const [clinicalNotes, setClinicalNotes] = useState<string>('');

  const [hiv, setHiv] = useState<ScreeningStatus>('negative');
  const [hepatitisB, setHepatitisB] = useState<ScreeningStatus>('negative');
  const [hepatitisC, setHepatitisC] = useState<ScreeningStatus>('negative');
  const [syphilis, setSyphilis] = useState<ScreeningStatus>('negative');

  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!batchNumber.trim()) {
      setError('Blood bag batch barcode identifier is required.');
      return;
    }

    if (!hemoglobinLevel.trim()) {
      setError('Hemoglobin measurement is required.');
      return;
    }

    const payload: BloodIntakePayload = {
      units: Number(units) || 1,
      batchNumber: batchNumber.trim(),
      screeningResults: {
        hiv,
        hepatitisB,
        hepatitisC,
        syphilis,
        hemoglobinLevel: hemoglobinLevel.trim(),
      },
      clinicalNotes: clinicalNotes.trim(),
    };

    startTransition(async () => {
      const res = await completeBloodDonation(donationId, payload);
      if (res.success) {
        toast.success(
          `Blood intake successfully recorded! 120-day medical lockout applied and thank-you email sent to ${donorName}.`,
        );
        onClose();
        if (onSuccess) onSuccess();
      } else {
        setError(res.error || 'Failed to record blood collection intake.');
        toast.error(res.error || 'Failed to record intake.');
      }
    });
  };

  return (
    <Dialog.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <Dialog.Portal>
        <Dialog.Backdrop className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm transition-opacity" />
        <Dialog.Popup className="fixed left-1/2 top-1/2 z-50 w-full max-w-xl -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-card border border-border p-6 shadow-2xl focus:outline-none max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="flex items-start justify-between pb-4 border-b border-border">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0">
                <Droplet className="w-5 h-5" />
              </div>
              <div>
                <Dialog.Title className="text-lg font-bold text-foreground">
                  Clinical Blood Collection Intake
                </Dialog.Title>
                <Dialog.Description className="text-xs text-muted-foreground mt-0.5">
                  Record bag ledger, viral screening tests, and hemoglobin for{' '}
                  <strong className="text-foreground">{donorName}</strong> (
                  <span className="text-primary font-bold font-tabular">
                    {donorBloodGroup}
                  </span>
                  ).
                </Dialog.Description>
              </div>
            </div>
            <Dialog.Close
              onClick={onClose}
              disabled={isPending}
              className="text-muted-foreground hover:text-foreground rounded-lg p-1 transition-colors hover:bg-muted"
            >
              <X className="w-5 h-5" />
              <span className="sr-only">Close</span>
            </Dialog.Close>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="mt-5 space-y-5">
            {error && (
              <div className="p-3 text-xs bg-destructive/10 border border-destructive/20 text-destructive rounded-lg flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Bag Barcode & Units */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-2 space-y-1.5">
                <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                  <Barcode className="w-3.5 h-3.5 text-muted-foreground" />
                  Bag Barcode / Batch ID <span className="text-primary">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={batchNumber}
                  onChange={(e) => setBatchNumber(e.target.value)}
                  placeholder="e.g. BAG-89201-A"
                  className="w-full h-10 px-3 rounded-lg border border-border bg-background text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary font-tabular"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">
                  Units Collected
                </label>
                <input
                  type="number"
                  min={1}
                  max={5}
                  value={units}
                  onChange={(e) => setUnits(Number(e.target.value))}
                  className="w-full h-10 px-3 rounded-lg border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary font-tabular text-center"
                />
              </div>
            </div>

            {/* Hemoglobin Level */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5 text-muted-foreground" />
                  Hemoglobin Level (g/dL){' '}
                  <span className="text-primary">*</span>
                </span>
                <span className="text-[11px] text-muted-foreground font-tabular font-normal">
                  Standard threshold: &ge; 12.5 g/dL
                </span>
              </label>
              <input
                type="text"
                required
                value={hemoglobinLevel}
                onChange={(e) => setHemoglobinLevel(e.target.value)}
                placeholder="e.g. 13.8"
                className="w-full h-10 px-3 rounded-lg border border-border bg-background text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary font-tabular"
              />
            </div>

            {/* Mandatory Viral Screenings Panel */}
            <div className="bg-muted/30 border border-border rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-primary" />
                  <span className="text-xs font-bold uppercase tracking-wider text-foreground">
                    Mandatory Viral Screenings
                  </span>
                </div>
                <span className="text-[11px] text-muted-foreground">
                  NBTS Transfusion Protocol
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-1">
                <div className="space-y-1">
                  <label className="text-[11px] font-medium text-muted-foreground">
                    HIV 1 & 2
                  </label>
                  <select
                    value={hiv}
                    onChange={(e) => setHiv(e.target.value as ScreeningStatus)}
                    className="w-full h-9 px-2.5 rounded-lg border border-border bg-background text-xs font-medium text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                  >
                    <option value="negative">Negative</option>
                    <option value="pending">Pending</option>
                    <option value="positive">Positive</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-medium text-muted-foreground">
                    Hepatitis B (HBsAg)
                  </label>
                  <select
                    value={hepatitisB}
                    onChange={(e) =>
                      setHepatitisB(e.target.value as ScreeningStatus)
                    }
                    className="w-full h-9 px-2.5 rounded-lg border border-border bg-background text-xs font-medium text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                  >
                    <option value="negative">Negative</option>
                    <option value="pending">Pending</option>
                    <option value="positive">Positive</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-medium text-muted-foreground">
                    Hepatitis C (HCV)
                  </label>
                  <select
                    value={hepatitisC}
                    onChange={(e) =>
                      setHepatitisC(e.target.value as ScreeningStatus)
                    }
                    className="w-full h-9 px-2.5 rounded-lg border border-border bg-background text-xs font-medium text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                  >
                    <option value="negative">Negative</option>
                    <option value="pending">Pending</option>
                    <option value="positive">Positive</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-medium text-muted-foreground">
                    Syphilis (VDRL)
                  </label>
                  <select
                    value={syphilis}
                    onChange={(e) =>
                      setSyphilis(e.target.value as ScreeningStatus)
                    }
                    className="w-full h-9 px-2.5 rounded-lg border border-border bg-background text-xs font-medium text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                  >
                    <option value="negative">Negative</option>
                    <option value="pending">Pending</option>
                    <option value="positive">Positive</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Clinical Observations Notes */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">
                Clinical Observations & Phlebotomy Notes
              </label>
              <textarea
                rows={2}
                value={clinicalNotes}
                onChange={(e) => setClinicalNotes(e.target.value)}
                placeholder="e.g. Donor tolerated phlebotomy well. Vitals normal (BP 120/80)."
                className="w-full p-2.5 rounded-lg border border-border bg-background text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary leading-relaxed resize-none"
              />
            </div>

            {/* Automated Protocol Notice */}
            <div className="bg-primary/5 border border-primary/20 rounded-xl p-3.5 text-xs text-muted-foreground space-y-1">
              <div className="flex items-center gap-1.5 font-semibold text-foreground text-[11px]">
                <CheckCircle2 className="w-3.5 h-3.5 text-primary" />
                Automatic Post-Intake Protocols:
              </div>
              <p className="text-[11px] leading-relaxed">
                &bull; Auto-computes <strong>35-day</strong> blood shelf-life
                (CPD-A1 whole blood standard).
                <br />
                &bull; Enforces strict <strong>120-day</strong> medical lockout
                on {donorName}&apos;s profile.
                <br />
                &bull; Dispatches automated clinical Thank-You email with
                recovery guidelines and next eligible date.
              </p>
            </div>

            {/* Footer Buttons */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-border">
              <button
                type="button"
                disabled={isPending}
                onClick={onClose}
                className="text-xs font-semibold px-4 py-2.5 rounded-lg border border-border text-foreground hover:bg-secondary transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isPending}
                className="text-xs font-semibold px-6 py-2.5 rounded-lg bg-primary hover:bg-red-700 text-primary-foreground transition-colors shadow-sm disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Recording Intake...
                  </>
                ) : (
                  'Confirm & Complete Intake'
                )}
              </button>
            </div>
          </form>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
