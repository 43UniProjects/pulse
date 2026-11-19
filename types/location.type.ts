/**
 * Represents geographic coordinates with longitude and latitude.
 */
export interface ILocationCoordinates {
  longitude: number;
  latitude: number;
}

/**
 * Browser geolocation permission states.
 */
export type GeolocationPermissionState =
  'granted' | 'prompt' | 'denied' | 'unsupported';

/**
 * State of the client-side location tracking engine.
 */
export interface ILocationSyncState {
  coords: ILocationCoordinates | null;
  hasGpsFix: boolean;
  isWatching: boolean;
  isSyncing: boolean;
  permissionStatus: GeolocationPermissionState;
  lastSyncedAt: Date | null;
  error: string | null;
}

/**
 * Response payload for location server actions.
 */
export interface ILocationActionResponse {
  success: boolean;
  error?: string;
  syncedAt?: string;
}
