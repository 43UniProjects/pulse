'use client';

import { useState } from 'react';
import { Navigation, X } from 'lucide-react';
import { useLocationTracker } from '@/hooks/use-location-tracker';

interface LocationTrackerProps {
  liveLocationSync?: boolean;
}

export default function LocationTracker({
  liveLocationSync = false,
}: LocationTrackerProps) {
  const { permissionStatus, requestLocation } = useLocationTracker({
    liveLocationSync,
  });
  const [dismissed, setDismissed] = useState(false);

  // If live location sync is enabled and permission is 'prompt', show gentle gesture prompt for iOS Safari
  if (liveLocationSync && permissionStatus === 'prompt' && !dismissed) {
    return (
      <div className="fixed bottom-4 right-4 z-50 max-w-sm bg-card border border-border shadow-lg rounded-xl p-4 flex items-start gap-3 animate-in fade-in slide-in-from-bottom-2">
        <div className="p-2 rounded-lg bg-primary/10 text-primary shrink-0 mt-0.5">
          <Navigation className="w-4 h-4 animate-pulse" />
        </div>
        <div className="flex-1 space-y-1">
          <h4 className="text-xs font-semibold text-foreground">
            Live Location Active
          </h4>
          <p className="text-[11px] text-muted-foreground leading-normal">
            Allow browser GPS access to match you with nearby emergencies.
          </p>
          <div className="pt-2 flex items-center gap-2">
            <button
              type="button"
              onClick={() => void requestLocation()}
              className="px-3 py-1 bg-primary text-primary-foreground text-xs font-medium rounded-md hover:bg-primary/90 transition-colors"
            >
              Enable GPS
            </button>
            <button
              type="button"
              onClick={() => setDismissed(true)}
              className="px-2 py-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              Not now
            </button>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setDismissed(true)}
          className="text-muted-foreground hover:text-foreground p-0.5"
          aria-label="Dismiss location prompt"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    );
  }

  // Headless background tracker
  return null;
}
