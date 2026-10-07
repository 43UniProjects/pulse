'use client';

import { useState, use } from 'react'; // 1. Import `use`
import { MapPin } from 'lucide-react';
import { getDonationRequest, RequestStatus } from '../data';

export default function RequestDetailClient({
  paramsPromise,
}: {
  paramsPromise: Promise<{ id: string }>; // 2. Accept the Promise
}) {
  // 3. Unwrap the promise directly using React's `use()` hook
  const { id } = use(paramsPromise);

  // The rest of your code remains exactly the same!
  const req = getDonationRequest(id);

  const [status, setStatus] = useState<RequestStatus>(req?.status || 'pending');

  if (!req) {
    return (
      <div className="p-8 max-w-4xl mx-auto font-sans text-center text-muted-foreground">
        Request record not found.
      </div>
    );
  }

  const statusStyles: Record<string, string> = {
    pending: 'bg-secondary text-secondary-foreground border border-border',
    accepted:
      'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20',
    completed:
      'bg-blue-500/15 text-blue-600 dark:text-blue-400 border border-blue-500/20',
    declined: 'bg-destructive/15 text-destructive border border-destructive/20',
  };

  const urgencyColors: Record<string, string> = {
    critical: 'bg-destructive/15 text-destructive border border-destructive/20',
    high: 'bg-orange-500/15 text-orange-600 dark:text-orange-400 border border-orange-500/20',
    normal: 'bg-secondary text-secondary-foreground border border-border',
  };

  return (
    <div className="p-8 max-w-4xl mx-auto font-sans">
      {/* Clinical Card Wrapper */}
      <div className="bg-card border border-border rounded-lg overflow-hidden shadow-sm">
        {/* Header */}
        <div className="p-6 border-b border-border flex items-start justify-between bg-card">
          <div>
            <h1 className="font-semibold text-xl text-card-foreground mb-1">
              {req.hospitalName}
            </h1>
            <p className="text-sm text-muted-foreground">{req.address}</p>
          </div>
          <span
            className={`text-xs font-medium px-2.5 py-1 rounded-sm capitalize ${statusStyles[status]}`}
          >
            {status}
          </span>
        </div>

        {/* Map Placeholder */}
        <div className="bg-input/50 h-40 flex items-center justify-center border-b border-border">
          <div className="text-center text-muted-foreground flex flex-col items-center gap-2">
            <MapPin className="w-6 h-6 opacity-50" />
            <div className="text-xs uppercase tracking-widest font-medium">
              Map Integration Pending
            </div>
            <div className="text-xs opacity-70 font-tabular">{req.address}</div>
          </div>
        </div>

        {/* Data Grid */}
        <div className="p-6 grid grid-cols-2 md:grid-cols-4 gap-6 bg-card">
          <div>
            <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
              Blood Group
            </div>
            <div className="font-semibold font-tabular text-3xl text-card-foreground">
              {req.bloodGroup}
            </div>
          </div>
          <div>
            <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
              Quantity
            </div>
            <div className="font-semibold font-tabular text-3xl text-card-foreground">
              {req.quantity}
            </div>
          </div>
          <div className="col-span-2 md:col-span-1">
            <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
              Urgency
            </div>
            <span
              className={`inline-block text-xs font-medium px-2.5 py-1 rounded-sm capitalize ${urgencyColors[req.urgency]}`}
            >
              {req.urgency}
            </span>
          </div>
          <div className="col-span-2 md:col-span-4 border-t border-border mt-2 pt-6">
            <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
              Clinical Notes
            </div>
            <div className="text-sm text-card-foreground leading-relaxed">
              {req.notes}
            </div>
          </div>
        </div>

        {/* Action Bar */}
        <div className="px-6 pb-6 pt-2 flex items-center gap-3 bg-card">
          {status === 'pending' ? (
            <>
              <button
                onClick={() => setStatus('accepted')}
                className="bg-primary text-primary-foreground font-medium text-sm px-6 py-2.5 rounded-md hover:bg-red-700 transition-colors focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background"
              >
                Accept Request
              </button>
              <button
                onClick={() => setStatus('declined')}
                className="bg-transparent border border-border text-foreground font-medium text-sm px-6 py-2.5 rounded-md hover:bg-secondary transition-colors"
              >
                Decline
              </button>
            </>
          ) : (
            <button
              onClick={() => setStatus('pending')}
              className="text-xs text-muted-foreground hover:text-foreground transition-colors underline underline-offset-4"
            >
              Undo response
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
