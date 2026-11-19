'use client';

import { useState, useActionState, useEffect, useRef } from 'react';
import {
  Building2,
  MapPin,
  Save,
  Loader2,
  Users,
  Phone,
  Mail,
  Globe,
  Building,
  AlertTriangle,
  Navigation,
} from 'lucide-react';
import { toast } from 'sonner';
import { updateHospitalProfile } from '@/actions/hospital.actions';
import { HospitalEntity, HOSPITAL_TYPE } from '@/types/hospital.type';

export default function HospitalProfileForm({
  initialData,
  isIncomplete = false,
  onCancel,
  onSuccess,
}: {
  initialData: HospitalEntity;
  isIncomplete?: boolean;
  onCancel: () => void;
  onSuccess: () => void;
}) {
  const [state, formAction, isPending] = useActionState(updateHospitalProfile, {
    success: false,
  });
  const lastStateRef = useRef(state);

  // Geolocation state for hospital facility coordinates
  const [coords, setCoords] = useState<{ longitude: number; latitude: number }>(
    {
      longitude: initialData.location?.coordinates?.[0] ?? 79.8612,
      latitude: initialData.location?.coordinates?.[1] ?? 6.9271,
    },
  );
  const [isDetectingLocation, setIsDetectingLocation] = useState(false);
  const [detectedTime, setDetectedTime] = useState<Date | null>(null);

  const handleDetectLocation = () => {
    if (typeof window === 'undefined' || !('geolocation' in navigator)) {
      toast.error('Geolocation is not supported by your browser.');
      return;
    }

    setIsDetectingLocation(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setCoords({
          longitude: position.coords.longitude,
          latitude: position.coords.latitude,
        });
        setDetectedTime(new Date());
        setIsDetectingLocation(false);
        toast.success('Hospital location detected successfully!');
      },
      (err) => {
        setIsDetectingLocation(false);
        toast.error(`Unable to retrieve location: ${err.message}`);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000,
      },
    );
  };

  // Automatically go back to view mode if submission was successful
  useEffect(() => {
    if (state === lastStateRef.current) return;
    lastStateRef.current = state;

    if (state.success) {
      toast.success(
        isIncomplete
          ? 'Facility profile completed! Your account is now activated.'
          : 'Profile updated successfully!',
      );
      const timer = setTimeout(() => {
        onSuccess();
      }, 600);
      return () => clearTimeout(timer);
    } else if (state.error) {
      toast.error(state.error);
    }
  }, [state, onSuccess, isIncomplete]);

  // Format hospital type label
  const formatType = (type: string) => {
    return type
      .split('_')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  return (
    <form action={formAction} className="space-y-8 pb-12">
      {isIncomplete && (
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h3 className="text-sm font-semibold text-amber-500">
              Account Deactivated
            </h3>
            <p className="text-xs text-muted-foreground">
              Please complete and save your facility profile details below to
              activate your account.
            </p>
          </div>
        </div>
      )}

      {/* Section 1: Facility Details */}
      <section className="space-y-4">
        <div className="flex items-center gap-2 mb-4">
          <Building2 className="w-5 h-5 text-muted-foreground" />
          <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">
            Facility Details
          </h2>
        </div>

        <div className="bg-card border border-border rounded-xl p-5 shadow-sm space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="space-y-2 sm:col-span-2">
              <label className="text-xs font-medium text-foreground block">
                Facility Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="name"
                defaultValue={initialData.name || ''}
                placeholder="e.g. National Hospital Colombo"
                required
                className="w-full h-10 px-3 rounded-md border border-border bg-background text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-primary transition-all"
              />
              {state.fieldErrors?.name && (
                <p className="text-xs text-red-500">
                  {state.fieldErrors.name[0]}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-xs font-medium text-foreground block">
                Facility Type <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <select
                  name="facilityType"
                  defaultValue={initialData.facilityType || ''}
                  required
                  className="w-full h-10 pl-10 pr-3 appearance-none rounded-md border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-primary transition-all"
                >
                  <option value="" disabled>
                    Select facility type
                  </option>
                  {HOSPITAL_TYPE.map((type) => (
                    <option key={type} value={type}>
                      {formatType(type)}
                    </option>
                  ))}
                </select>
                <Building className="w-4 h-4 text-muted-foreground absolute left-3 top-3 opacity-80 pointer-events-none" />
              </div>
              {state.fieldErrors?.facilityType && (
                <p className="text-xs text-red-500">
                  {state.fieldErrors.facilityType[0]}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-xs font-medium text-foreground block">
                Website{' '}
                <span className="text-muted-foreground text-xs font-normal">
                  (Optional)
                </span>
              </label>
              <div className="relative">
                <input
                  type="url"
                  name="website"
                  defaultValue={initialData.website || ''}
                  placeholder="https://..."
                  className="w-full h-10 pl-10 pr-3 rounded-md border border-border bg-background text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-primary transition-all"
                />
                <Globe className="w-4 h-4 text-muted-foreground absolute left-3 top-3 opacity-80 pointer-events-none" />
              </div>
              {state.fieldErrors?.website && (
                <p className="text-xs text-red-500">
                  {state.fieldErrors.website[0]}
                </p>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Section 2: Contact & Address */}
      <section className="space-y-4">
        <div className="flex items-center gap-2 mb-4">
          <MapPin className="w-5 h-5 text-muted-foreground" />
          <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">
            Contact & Location
          </h2>
        </div>

        <div className="bg-card border border-border rounded-xl p-5 shadow-sm space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="space-y-2">
              <label className="text-xs font-medium text-foreground block">
                Department/Desk Email{' '}
                <span className="text-muted-foreground text-[10px]">
                  (Locked)
                </span>
              </label>
              <div className="relative">
                <input
                  type="email"
                  name="email"
                  value={initialData.email}
                  readOnly
                  className="w-full h-10 pl-10 pr-3 rounded-md border border-border/80 bg-muted text-muted-foreground cursor-not-allowed select-none text-sm transition-all focus:outline-none"
                />
                <Mail className="w-4 h-4 text-muted-foreground absolute left-3 top-3 opacity-80 pointer-events-none" />
              </div>
              <p className="text-xs text-muted-foreground">
                Your registered facility email cannot be changed.
              </p>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-medium text-foreground block">
                Hotline Number <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="tel"
                  name="hotline"
                  defaultValue={initialData.hotline || ''}
                  placeholder="e.g. +94 11 234 5678"
                  required
                  className="w-full h-10 pl-10 pr-3 rounded-md border border-border bg-background text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-primary transition-all"
                />
                <Phone className="w-4 h-4 text-muted-foreground absolute left-3 top-3 opacity-80 pointer-events-none" />
              </div>
              {state.fieldErrors?.hotline && (
                <p className="text-xs text-red-500">
                  {state.fieldErrors.hotline[0]}
                </p>
              )}
            </div>

            <div className="space-y-2 sm:col-span-2">
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-medium text-foreground block">
                  Street Address <span className="text-red-500">*</span>
                </label>
                <button
                  type="button"
                  onClick={handleDetectLocation}
                  disabled={isDetectingLocation}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-primary hover:text-primary/80 bg-primary/10 hover:bg-primary/15 rounded-md transition-colors disabled:opacity-50 cursor-pointer"
                >
                  {isDetectingLocation ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      Detecting GPS...
                    </>
                  ) : (
                    <>
                      <Navigation className="w-3.5 h-3.5" />
                      Detect Current Location
                    </>
                  )}
                </button>
              </div>
              <input
                type="text"
                name="address"
                defaultValue={initialData.address || ''}
                placeholder="e.g. Regent Street, Colombo 08"
                required
                className="w-full h-10 px-3 rounded-md border border-border bg-background text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-primary transition-all"
              />
              {state.fieldErrors?.address && (
                <p className="text-xs text-red-500">
                  {state.fieldErrors.address[0]}
                </p>
              )}
            </div>

            <div className="space-y-2 sm:col-span-2">
              <label className="text-xs font-medium text-foreground block">
                City <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="city"
                defaultValue={initialData.city || ''}
                placeholder="e.g. Colombo"
                required
                className="w-full h-10 px-3 rounded-md border border-border bg-background text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-primary transition-all"
              />
              {state.fieldErrors?.city && (
                <p className="text-xs text-red-500">
                  {state.fieldErrors.city[0]}
                </p>
              )}
            </div>

            {/* Hidden GeoJSON fields bound to React state */}
            <input type="hidden" name="longitude" value={coords.longitude} />
            <input type="hidden" name="latitude" value={coords.latitude} />

            {/* GPS Feedback Badge */}
            <div className="sm:col-span-2 flex items-center gap-2 text-[11px] text-muted-foreground">
              <MapPin className="w-3.5 h-3.5 text-primary shrink-0" />
              <span>
                Coordinates:{' '}
                <span className="font-tabular text-foreground font-medium">
                  {coords.latitude.toFixed(4)}° N, {coords.longitude.toFixed(4)}
                  ° E
                </span>
                {detectedTime && (
                  <span className="ml-1.5 text-emerald-600 dark:text-emerald-400 font-medium">
                    (Updated just now)
                  </span>
                )}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Section 3: Coordinator Information */}
      <section className="space-y-4">
        <div className="flex items-center gap-2 mb-4">
          <Users className="w-5 h-5 text-muted-foreground" />
          <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">
            Coordinator Details
          </h2>
        </div>

        <div className="bg-card border border-border rounded-xl p-5 shadow-sm space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="space-y-2">
              <label className="text-xs font-medium text-foreground block">
                Coordinator Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="coordinatorName"
                defaultValue={initialData.coordinator?.name || ''}
                placeholder="e.g. Dr. Priyantha Silva"
                required
                className="w-full h-10 px-3 rounded-md border border-border bg-background text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-primary transition-all"
              />
              {state.fieldErrors?.coordinatorName && (
                <p className="text-xs text-red-500">
                  {state.fieldErrors.coordinatorName[0]}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-xs font-medium text-foreground block">
                Designation <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="coordinatorDesignation"
                defaultValue={initialData.coordinator?.designation || ''}
                placeholder="e.g. Blood Bank Coordinator"
                required
                className="w-full h-10 px-3 rounded-md border border-border bg-background text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-primary transition-all"
              />
              {state.fieldErrors?.coordinatorDesignation && (
                <p className="text-xs text-red-500">
                  {state.fieldErrors.coordinatorDesignation[0]}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-xs font-medium text-foreground block">
                Contact Number <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                name="coordinatorContactNumber"
                defaultValue={initialData.coordinator?.contactNumber || ''}
                placeholder="e.g. +94 77 987 6543"
                required
                className="w-full h-10 px-3 rounded-md border border-border bg-background text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-primary transition-all"
              />
              {state.fieldErrors?.coordinatorContactNumber && (
                <p className="text-xs text-red-500">
                  {state.fieldErrors.coordinatorContactNumber[0]}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-xs font-medium text-foreground block">
                Email Address <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                name="coordinatorEmail"
                defaultValue={initialData.coordinator?.email || ''}
                placeholder="e.g. coordinator@hospital.lk"
                required
                className="w-full h-10 px-3 rounded-md border border-border bg-background text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-primary transition-all"
              />
              {state.fieldErrors?.coordinatorEmail && (
                <p className="text-xs text-red-500">
                  {state.fieldErrors.coordinatorEmail[0]}
                </p>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Action Footer */}
      <div className="pt-6 border-t border-border flex items-center justify-end gap-3 sticky bottom-0 bg-background/80 backdrop-blur-md pb-4 z-10">
        {!isIncomplete && (
          <button
            type="button"
            onClick={onCancel}
            disabled={isPending}
            className="px-5 py-2.5 rounded-md text-sm font-medium text-foreground hover:bg-secondary transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          disabled={isPending}
          className="inline-flex items-center justify-center px-6 py-2.5 rounded-md bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:opacity-50 shadow-sm"
        >
          {isPending ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="w-4 h-4 mr-2" />
              {isIncomplete
                ? 'Save & Activate Facility'
                : 'Save Facility Profile'}
            </>
          )}
        </button>
      </div>
    </form>
  );
}
