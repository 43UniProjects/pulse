'use client';

import { useRef, useState } from 'react';
import { toast } from 'sonner';

interface UseDetectLocationOptions {
  initialCoordinates?: [number, number];
  initiallyCaptured: boolean;
  successMessage: string;
}

/**
 * Manages manual GPS location detection and enforces at least one
 * successful capture before profile form submission.
 */
export function useDetectLocation({
  initialCoordinates,
  initiallyCaptured,
  successMessage,
}: UseDetectLocationOptions) {
  const [coords, setCoords] = useState<{ longitude: number; latitude: number }>(
    {
      longitude: initialCoordinates?.[0] ?? 79.8612,
      latitude: initialCoordinates?.[1] ?? 6.9271,
    },
  );
  const [hasDetectedLocation, setHasDetectedLocation] =
    useState<boolean>(initiallyCaptured);
  const [isDetectingLocation, setIsDetectingLocation] = useState(false);
  const [detectedTime, setDetectedTime] = useState<Date | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const detectButtonRef = useRef<HTMLButtonElement | null>(null);

  const handleDetectLocation = () => {
    if (typeof window === 'undefined' || !('geolocation' in navigator)) {
      const msg = 'Geolocation is not supported by your browser.';
      setLocationError(msg);
      toast.error(msg);
      return;
    }

    setIsDetectingLocation(true);
    setLocationError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setCoords({
          longitude: position.coords.longitude,
          latitude: position.coords.latitude,
        });
        setHasDetectedLocation(true);
        setDetectedTime(new Date());
        setLocationError(null);
        setIsDetectingLocation(false);
        toast.success(successMessage);
      },
      (err) => {
        setIsDetectingLocation(false);
        const msg = `Unable to retrieve location: ${err.message}`;
        setLocationError(msg);
        toast.error(msg);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000,
      },
    );
  };

  const requireLocationBeforeSubmit = (
    e: React.FormEvent<HTMLFormElement>,
  ): boolean => {
    if (hasDetectedLocation) {
      return true;
    }

    e.preventDefault();
    const msg =
      'Please click "Update Live Location" to capture your GPS coordinates before saving.';
    setLocationError(msg);
    toast.error(msg);
    detectButtonRef.current?.scrollIntoView({
      behavior: 'smooth',
      block: 'center',
    });
    detectButtonRef.current?.focus();
    return false;
  };

  return {
    coords,
    hasDetectedLocation,
    isDetectingLocation,
    detectedTime,
    locationError,
    detectButtonRef,
    handleDetectLocation,
    requireLocationBeforeSubmit,
  };
}
