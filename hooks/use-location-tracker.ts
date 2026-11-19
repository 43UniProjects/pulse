'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { syncDonorLocation } from '@/actions/location.actions';
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

  // Single-shot GPS position request (for explicit user gesture like "Detect Location" button)
  const requestLocation =
    useCallback(async (): Promise<ILocationCoordinates | null> => {
      if (typeof window === 'undefined' || !('geolocation' in navigator)) {
        setError('Geolocation is not supported by your browser.');
        return null;
      }

      return new Promise((resolve) => {
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            const newCoords: ILocationCoordinates = {
              longitude: position.coords.longitude,
              latitude: position.coords.latitude,
            };

            setCoords(newCoords);
            setHasGpsFix(true);
            setError(null);

            // Sync initial fix to MongoDB
            try {
              setIsSyncing(true);
              isSyncingRef.current = true;
              const res = await syncDonorLocation(newCoords);
              if (res.success) {
                const now = new Date();
                lastSyncedCoordsRef.current = newCoords;
                lastSyncedTimeRef.current = now;
                setLastSyncedAt(now);
              }
            } catch (err: unknown) {
              console.error('[LocationTracker] Initial sync failed:', err);
            } finally {
              setIsSyncing(false);
              isSyncingRef.current = false;
            }

            resolve(newCoords);
          },
          (geoError) => {
            setHasGpsFix(false);
            setError(geoError.message);
            resolve(null);
          },
          {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 300000,
          },
        );
      });
    }, []);

  // Background Watcher: continuous watching when liveLocationSync is true
  useEffect(() => {
    if (
      !liveLocationSync ||
      typeof window === 'undefined' ||
      !('geolocation' in navigator)
    ) {
      return;
    }

    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        const newCoords: ILocationCoordinates = {
          longitude: position.coords.longitude,
          latitude: position.coords.latitude,
        };
        setCoords(newCoords);
        setHasGpsFix(true);
        setIsWatching(true);
        setError(null);
      },
      (geoError) => {
        setHasGpsFix(false);
        setIsWatching(false);
        setError(geoError.message);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000,
      },
    );

    return () => {
      navigator.geolocation.clearWatch(watchId);
      setIsWatching(false);
    };
  }, [liveLocationSync]);

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
