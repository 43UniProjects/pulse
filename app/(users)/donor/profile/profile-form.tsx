'use client';

import { useActionState, useState, useEffect } from 'react';
import {
  Bell,
  Moon,
  Smartphone,
  Mail,
  MapPin,
  Save,
  AlertTriangle,
  Loader2,
  User,
  Radar,
  Navigation,
  Droplet,
} from 'lucide-react';
import { toast } from 'sonner';
import { updateDonorProfile } from '@/actions/donor.actions';
import { DonorEntity } from '@/types/donor.type';
import { BLOOD_GROUPS } from '@/types/common.type';

export default function DonorProfileForm({
  initialData,
  onCancel,
  onSuccess,
}: {
  initialData: DonorEntity;
  onCancel: () => void;
  onSuccess: () => void;
}) {
  const [state, formAction, isPending] = useActionState(updateDonorProfile, {
    success: false,
  });

  useEffect(() => {
    if (state.success) {
      toast.success('Profile updated successfully!');
      const timer = setTimeout(() => {
        onSuccess();
      }, 1000); // Wait 1s to show the success message before switching view
      return () => clearTimeout(timer);
    } else if (state.error && !state.fieldErrors) {
      toast.error(state.error);
    }
  }, [state, onSuccess]);

  // Manage slider and toggles state so UI updates immediately
  const [radius, setRadius] = useState(initialData.radiusPreferenceKm);
  const [isAvailable, setIsAvailable] = useState(initialData.isAvailable);
  const [liveLocationSync, setLiveLocationSync] = useState(
    initialData.liveLocationSync,
  );
  const [smsAlertsEnabled, setSmsAlertsEnabled] = useState(
    initialData.smsAlertsEnabled,
  );
  const [emailAlertsEnabled, setEmailAlertsEnabled] = useState(
    initialData.emailAlertsEnabled,
  );

  return (
    <form action={formAction} className="space-y-8 pb-12">
      {/* Section 1: Personal & Medical Information */}
      <section className="space-y-4">
        <div className="flex items-center gap-2 mb-4">
          <User className="w-5 h-5 text-muted-foreground" />
          <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">
            Personal Information
          </h2>
        </div>

        <div className="bg-card border border-border rounded-xl p-5 shadow-sm space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="space-y-2">
              <label className="text-xs font-medium text-foreground block">
                Full Name
              </label>
              <input
                type="text"
                name="fullName"
                defaultValue={initialData.fullName}
                className="w-full h-10 px-3 rounded-md border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-primary transition-all"
              />
              {state.fieldErrors?.fullName && (
                <p className="text-xs text-red-500">
                  {state.fieldErrors.fullName[0]}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-xs font-medium text-foreground block">
                Blood Group
              </label>
              <div className="relative">
                <select
                  name="bloodGroup"
                  defaultValue={initialData.bloodGroup}
                  className="w-full h-10 pl-10 pr-3 appearance-none rounded-md border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-primary transition-all"
                >
                  {BLOOD_GROUPS.map((group) => (
                    <option key={group} value={group}>
                      {group}
                    </option>
                  ))}
                </select>
                <Droplet className="w-4 h-4 text-primary absolute left-3 top-3 opacity-80" />
              </div>
              {state.fieldErrors?.bloodGroup && (
                <p className="text-xs text-red-500">
                  {state.fieldErrors.bloodGroup[0]}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-xs font-medium text-foreground block">
                Contact Email
              </label>
              <input
                type="email"
                name="email"
                defaultValue={initialData.email}
                className="w-full h-10 px-3 rounded-md border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-primary transition-all"
              />
              {state.fieldErrors?.email && (
                <p className="text-xs text-red-500">
                  {state.fieldErrors.email[0]}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-xs font-medium text-foreground block">
                Phone Number
              </label>
              <input
                type="tel"
                name="phone"
                defaultValue={initialData.phone}
                className="w-full h-10 px-3 rounded-md border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-primary transition-all"
              />
              {state.fieldErrors?.phone && (
                <p className="text-xs text-red-500">
                  {state.fieldErrors.phone[0]}
                </p>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Section 2: Dispatch & Location */}
      <section className="space-y-4">
        <div className="flex items-center gap-2 mb-4">
          <MapPin className="w-5 h-5 text-muted-foreground" />
          <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">
            Dispatch & Location
          </h2>
        </div>

        <div className="bg-card border border-border rounded-xl divide-y divide-border overflow-hidden shadow-sm">
          <div className="p-5">
            <label className="text-xs font-medium text-foreground block mb-2">
              Current Address
            </label>
            <input
              type="text"
              name="address"
              defaultValue={initialData.address}
              className="w-full h-10 px-3 rounded-md border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-primary transition-all"
            />
            {state.fieldErrors?.address && (
              <p className="text-xs text-red-500 mt-1">
                {state.fieldErrors.address[0]}
              </p>
            )}

            {/* Hidden inputs for GeoJSON coords for now - would use map picker in real life */}
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

          <div className="p-5 hover:bg-secondary/20 transition-colors">
            <div className="flex items-start gap-4">
              <div className="shrink-0 mt-0.5 p-2 bg-secondary rounded-lg border border-border">
                <Radar className="w-5 h-5 text-foreground" />
              </div>
              <div className="flex-1 pr-2">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="text-sm font-medium text-foreground">
                    Alert Radius
                  </h3>
                  <span className="text-sm font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-md">
                    {radius} km
                  </span>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                  The maximum distance from your location you are willing to
                  travel for a donation.
                </p>
                <input
                  type="range"
                  name="radiusPreferenceKm"
                  min="1"
                  max="100"
                  step="1"
                  value={radius}
                  onChange={(e) => setRadius(parseInt(e.target.value))}
                  className="w-full h-2 bg-border rounded-lg appearance-none cursor-pointer accent-primary"
                />
                <div className="flex justify-between text-xs text-muted-foreground mt-2 font-mono">
                  <span>1 km</span>
                  <span>100 km</span>
                </div>
              </div>
            </div>
          </div>

          <SettingRow
            icon={<Navigation className="w-5 h-5 text-foreground" />}
            title="Dynamic Background Location"
            description="Receive alerts for emergencies near your LIVE location when you are away from home."
            checked={liveLocationSync}
            name="liveLocationSync"
            onToggle={() => setLiveLocationSync(!liveLocationSync)}
          />
        </div>
      </section>

      {/* Section 3: Availability (Do Not Disturb) */}
      <section className="space-y-4">
        <div className="flex items-center gap-2 mb-4">
          <Moon className="w-5 h-5 text-muted-foreground" />
          <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">
            Clinical Availability
          </h2>
        </div>

        <div className="bg-card border border-border rounded-xl p-5 shadow-sm flex items-start gap-4">
          <div className="flex-1">
            <h3 className="text-sm font-medium text-foreground mb-1">
              Currently Available to Donate
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              Turn this OFF if you are sick, traveling, or otherwise unable to
              donate. You will not receive emergency alerts.
            </p>
            {!isAvailable && (
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-yellow-500/10 text-yellow-700 dark:text-yellow-500 border border-yellow-500/20 rounded-md text-xs font-medium mb-2">
                <AlertTriangle className="w-4 h-4" />
                Account currently suspended from emergency dispatch.
              </div>
            )}
          </div>
          <div className="shrink-0 mt-1">
            <input
              type="hidden"
              name="isAvailable"
              value={isAvailable.toString()}
            />
            <CustomToggle
              checked={isAvailable}
              onChange={() => setIsAvailable(!isAvailable)}
              dangerMode={false}
            />
          </div>
        </div>
      </section>

      {/* Section 4: Notifications */}
      <section className="space-y-4">
        <div className="flex items-center gap-2 mb-4">
          <Bell className="w-5 h-5 text-muted-foreground" />
          <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">
            Notification Preferences
          </h2>
        </div>

        <div className="bg-card border border-border rounded-xl divide-y divide-border overflow-hidden shadow-sm">
          <SettingRow
            icon={<Smartphone className="w-5 h-5 text-foreground" />}
            title="SMS Emergency Alerts"
            description="Receive immediate text messages when your blood group is needed nearby."
            checked={smsAlertsEnabled}
            name="smsAlertsEnabled"
            onToggle={() => setSmsAlertsEnabled(!smsAlertsEnabled)}
          />
          <SettingRow
            icon={<Mail className="w-5 h-5 text-foreground" />}
            title="Email Notifications"
            description="Receive non-critical updates, newsletters, and appointment reminders via email."
            checked={emailAlertsEnabled}
            name="emailAlertsEnabled"
            onToggle={() => setEmailAlertsEnabled(!emailAlertsEnabled)}
          />
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
              Save Preferences
            </>
          )}
        </button>
      </div>
    </form>
  );
}

// --- Helper Components ---

function SettingRow({
  icon,
  title,
  description,
  checked,
  name,
  onToggle,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  checked: boolean;
  name: string;
  onToggle: () => void;
}) {
  return (
    <div className="p-5 flex items-start gap-4 hover:bg-secondary/20 transition-colors">
      <div className="shrink-0 mt-0.5 p-2 bg-secondary rounded-lg border border-border">
        {icon}
      </div>
      <div className="flex-1 pr-4">
        <h3 className="text-sm font-medium text-foreground mb-1">{title}</h3>
        <p className="text-sm text-muted-foreground leading-relaxed">
          {description}
        </p>
      </div>
      <div className="shrink-0 mt-1">
        <input type="hidden" name={name} value={checked.toString()} />
        <CustomToggle checked={checked} onChange={onToggle} />
      </div>
    </div>
  );
}

function CustomToggle({
  checked,
  onChange,
  dangerMode = false,
}: {
  checked: boolean;
  onChange: () => void;
  dangerMode?: boolean;
}) {
  const activeBg = dangerMode ? 'bg-orange-500' : 'bg-primary';

  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={onChange}
      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background ${
        checked ? activeBg : 'bg-border'
      }`}
    >
      <span
        className={`pointer-events-none block h-5 w-5 rounded-full bg-white shadow-sm ring-0 transition-transform ${
          checked ? 'translate-x-[22px]' : 'translate-x-[2px]'
        }`}
      />
    </button>
  );
}
