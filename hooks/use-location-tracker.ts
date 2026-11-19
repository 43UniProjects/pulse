'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import {
  GeolocationPermissionState,
  ILocationCoordinates,
  ILocationSyncState,
} from '@/types/location.type';

export interface UseLocationTrackerOptions {
  /**
   * Whether dynamic background live location sync is active.
   * Controlled by donor's liveLocationSync toggle preference.
   */
  liveLocationSync?: boolean;
}

export function useLocationTracker({
  liveLocationSync = false,
}: UseLocationTrackerOptions = {}) {
  // Main sync and tracking states
  const [coords, setCoords] = useState<ILocationCoordinates | null>(null);
  const [hasGpsFix, setHasGpsFix] = useState<boolean>(false);
  const [isWatching, setIsWatching] = useState<boolean>(false);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [permissionStatus, setPermissionStatus] =
    useState<GeolocationPermissionState>('prompt');
  const [lastSyncedAt, setLastSyncedAt] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Mutable refs to track coordinates and sync timestamps without triggering rerenders
  const lastSyncedCoordsRef = useRef<ILocationCoordinates | null>(null);
  const lastSyncedTimeRef = useRef<Date | null>(null);
  const isSyncingRef = useRef<boolean>(false);

  // Safely check and subscribe to browser geolocation permissions
  useEffect(() => {
    if (typeof window === 'undefined' || !('navigator' in window)) return;

    let permissionObj: PermissionStatus | null = null;

    const checkPermission = async () => {
      try {
        if (
          'permissions' in navigator &&
          typeof navigator.permissions.query === 'function'
        ) {
          const status = await navigator.permissions.query({
            name: 'geolocation' as PermissionName,
          });
          permissionObj = status;
          setPermissionStatus(status.state as GeolocationPermissionState);

          status.onchange = () => {
            setPermissionStatus(status.state as GeolocationPermissionState);
          };
        }
      } catch {
        // Safari iOS and older browsers may reject geolocation query
        // Gracefully fallback to 'prompt' without throwing runtime errors
        setPermissionStatus('prompt');
      }
    };

    checkPermission();

    return () => {
      if (permissionObj) {
        permissionObj.onchange = null;
      }
    };
  }, []);

  // Placeholder for user-triggered location request
  const requestLocation = useCallback(async () => {
    // Will be implemented in subsequent commits
  }, []);

  const state: ILocationSyncState = {
    coords,
    hasGpsFix,
    isWatching,
    isSyncing,
    permissionStatus,
    lastSyncedAt,
    error,
  };

  return {
    ...state,
    requestLocation,
  };
}
