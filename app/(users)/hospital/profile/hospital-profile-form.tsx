'use client';

import { useActionState, useEffect } from 'react';
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
} from 'lucide-react';
import { updateHospitalProfile } from '@/actions/hospital.actions';
import { HospitalEntity, HOSPITAL_TYPE } from '@/types/hospital.type';

export default function HospitalProfileForm({
  initialData,
  onCancel,
  onSuccess,
}: {
  initialData: HospitalEntity;
  onCancel: () => void;
  onSuccess: () => void;
}) {
  const [state, formAction, isPending] = useActionState(updateHospitalProfile, {
    success: false,
    message: '',
  });

  // Automatically go back to view mode if submission was successful
  useEffect(() => {
    if (state.success) {
      const timer = setTimeout(() => {
        onSuccess();
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [state.success, onSuccess]);

  // Format hospital type label
  const formatType = (type: string) => {
    return type
      .split('_')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  return (
    <form action={formAction} className="space-y-8 pb-12">
      {state.message && (
        <div
          className={`p-4 rounded-md border text-sm font-medium ${
            state.success
              ? 'bg-green-500/10 text-green-600 border-green-500/20'
              : 'bg-red-500/10 text-red-600 border-red-500/20'
          }`}
        >
          {state.message}
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
                Facility Name
              </label>
              <input
                type="text"
                name="name"
                defaultValue={initialData.name}
                className="w-full h-10 px-3 rounded-md border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-primary transition-all"
              />
              {state.errors?.name && (
                <p className="text-xs text-red-500">{state.errors.name[0]}</p>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-xs font-medium text-foreground block">
                Facility Type
              </label>
              <div className="relative">
                <select
                  name="facilityType"
                  defaultValue={initialData.facilityType}
                  className="w-full h-10 pl-10 pr-3 appearance-none rounded-md border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-primary transition-all"
                >
                  {HOSPITAL_TYPE.map((type) => (
                    <option key={type} value={type}>
                      {formatType(type)}
                    </option>
                  ))}
                </select>
                <Building className="w-4 h-4 text-muted-foreground absolute left-3 top-3 opacity-80" />
              </div>
              {state.errors?.facilityType && (
                <p className="text-xs text-red-500">
                  {state.errors.facilityType[0]}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-xs font-medium text-foreground block">
                Website (Optional)
              </label>
              <div className="relative">
                <input
                  type="url"
                  name="website"
                  defaultValue={initialData.website || ''}
                  placeholder="https://..."
                  className="w-full h-10 pl-10 pr-3 rounded-md border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-primary transition-all"
                />
                <Globe className="w-4 h-4 text-muted-foreground absolute left-3 top-3 opacity-80" />
              </div>
              {state.errors?.website && (
                <p className="text-xs text-red-500">
                  {state.errors.website[0]}
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
                Department/Desk Email
              </label>
              <div className="relative">
                <input
                  type="email"
                  name="email"
                  defaultValue={initialData.email}
                  className="w-full h-10 pl-10 pr-3 rounded-md border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-primary transition-all"
                />
                <Mail className="w-4 h-4 text-muted-foreground absolute left-3 top-3 opacity-80" />
              </div>
              <p className="text-xs text-muted-foreground">
                Publicly visible contact email.
              </p>
              {state.errors?.email && (
                <p className="text-xs text-red-500">{state.errors.email[0]}</p>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-xs font-medium text-foreground block">
                Hotline Number
              </label>
              <div className="relative">
                <input
                  type="tel"
                  name="hotline"
                  defaultValue={initialData.hotline}
                  className="w-full h-10 pl-10 pr-3 rounded-md border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-primary transition-all"
                />
                <Phone className="w-4 h-4 text-muted-foreground absolute left-3 top-3 opacity-80" />
              </div>
              {state.errors?.hotline && (
                <p className="text-xs text-red-500">
                  {state.errors.hotline[0]}
                </p>
              )}
            </div>

            <div className="space-y-2 sm:col-span-2">
              <label className="text-xs font-medium text-foreground block">
                Street Address
              </label>
              <input
                type="text"
                name="address"
                defaultValue={initialData.address}
                className="w-full h-10 px-3 rounded-md border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-primary transition-all"
              />
              {state.errors?.address && (
                <p className="text-xs text-red-500">
                  {state.errors.address[0]}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-xs font-medium text-foreground block">
                City
              </label>
              <input
                type="text"
                name="city"
                defaultValue={initialData.city}
                className="w-full h-10 px-3 rounded-md border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-primary transition-all"
              />
              {state.errors?.city && (
                <p className="text-xs text-red-500">{state.errors.city[0]}</p>
              )}
            </div>

            {/* Hidden GeoJSON fields */}
            <input
              type="hidden"
              name="longitude"
              value={initialData.location.coordinates[0]}
            />
            <input
              type="hidden"
              name="latitude"
              value={initialData.location.coordinates[1]}
            />
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
                Coordinator Name
              </label>
              <input
                type="text"
                name="coordinatorName"
                defaultValue={initialData.coordinator.name}
                className="w-full h-10 px-3 rounded-md border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-primary transition-all"
              />
              {state.errors?.coordinatorName && (
                <p className="text-xs text-red-500">
                  {state.errors.coordinatorName[0]}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-xs font-medium text-foreground block">
                Designation
              </label>
              <input
                type="text"
                name="coordinatorDesignation"
                defaultValue={initialData.coordinator.designation}
                placeholder="e.g. Chief Medical Officer"
                className="w-full h-10 px-3 rounded-md border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-primary transition-all"
              />
              {state.errors?.coordinatorDesignation && (
                <p className="text-xs text-red-500">
                  {state.errors.coordinatorDesignation[0]}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-xs font-medium text-foreground block">
                Contact Number
              </label>
              <input
                type="tel"
                name="coordinatorContactNumber"
                defaultValue={initialData.coordinator.contactNumber}
                className="w-full h-10 px-3 rounded-md border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-primary transition-all"
              />
              {state.errors?.coordinatorContactNumber && (
                <p className="text-xs text-red-500">
                  {state.errors.coordinatorContactNumber[0]}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-xs font-medium text-foreground block">
                Email Address
              </label>
              <input
                type="email"
                name="coordinatorEmail"
                defaultValue={initialData.coordinator.email}
                className="w-full h-10 px-3 rounded-md border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-primary transition-all"
              />
              {state.errors?.coordinatorEmail && (
                <p className="text-xs text-red-500">
                  {state.errors.coordinatorEmail[0]}
                </p>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Action Footer */}
      <div className="pt-6 border-t border-border flex items-center justify-end gap-3 sticky bottom-0 bg-background/80 backdrop-blur-md pb-4 z-10">
        <button
          type="button"
          onClick={onCancel}
          disabled={isPending}
          className="px-5 py-2.5 rounded-md text-sm font-medium text-foreground hover:bg-secondary transition-colors disabled:opacity-50"
        >
          Cancel
        </button>
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
              Save Facility Profile
            </>
          )}
        </button>
      </div>
    </form>
  );
}
