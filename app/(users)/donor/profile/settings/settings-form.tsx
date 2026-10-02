'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Bell,
  Shield,
  Moon,
  Key,
  Smartphone,
  Mail,
  MapPin,
  Save,
  AlertTriangle,
  Loader2,
  User,
  Radar,
  Navigation,
} from 'lucide-react';

export default function SettingsForm() {
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);

  // Expanded settings state incorporating contact info and dynamic location
  const [settings, setSettings] = useState({
    email: 'kamal@example.com',
    phone: '+94 77 123 4567',
    radius: 10,
    smsAlerts: true,
    emailAlerts: false,
    sharePreciseLocation: true,
    liveLocationSync: false,
    doNotDisturb: false,
  });

  const handleToggle = (key: keyof typeof settings) => {
    setSettings((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSettings((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 800));
    setIsSaving(false);
    router.push('/donor/profile'); // Redirect back to profile on success
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Section 1: Contact Information */}
      <section className="space-y-4">
        <div className="flex items-center gap-2 mb-4">
          <User className="w-5 h-5 text-muted-foreground" />
          <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">
            Contact Information
          </h2>
        </div>

        <div className="bg-card border border-border rounded-xl p-5 shadow-sm space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="space-y-2">
              <label className="text-xs font-medium text-foreground block">
                Email Address
              </label>
              <input
                type="email"
                name="email"
                value={settings.email}
                onChange={handleChange}
                className="w-full h-10 px-3 rounded-md border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-primary transition-all"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-medium text-foreground block">
                Phone Number (SMS)
              </label>
              <input
                type="tel"
                name="phone"
                value={settings.phone}
                onChange={handleChange}
                className="w-full h-10 px-3 rounded-md border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-primary transition-all"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Section 2: Notifications */}
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
            checked={settings.smsAlerts}
            onToggle={() => handleToggle('smsAlerts')}
          />
          <SettingRow
            icon={<Mail className="w-5 h-5 text-foreground" />}
            title="Email Notifications"
            description="Receive non-critical updates, newsletters, and appointment reminders via email."
            checked={settings.emailAlerts}
            onToggle={() => handleToggle('emailAlerts')}
          />
        </div>
      </section>

      {/* Section 3: Privacy, Location & Radius */}
      <section className="space-y-4">
        <div className="flex items-center gap-2 mb-4">
          <Shield className="w-5 h-5 text-muted-foreground" />
          <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">
            Location & Radius
          </h2>
        </div>

        <div className="bg-card border border-border rounded-xl divide-y divide-border overflow-hidden shadow-sm">
          {/* Radius Slider */}
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
                    {settings.radius} km
                  </span>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                  The maximum distance from your location you are willing to
                  travel for a donation.
                </p>
                <input
                  type="range"
                  name="radius"
                  min="1"
                  max="50"
                  step="1"
                  value={settings.radius}
                  onChange={handleChange}
                  className="w-full h-2 bg-border rounded-lg appearance-none cursor-pointer accent-primary"
                />
                <div className="flex justify-between text-xs text-muted-foreground mt-2 font-mono">
                  <span>1 km</span>
                  <span>50 km</span>
                </div>
              </div>
            </div>
          </div>

          <SettingRow
            icon={<MapPin className="w-5 h-5 text-foreground" />}
            title="Precise Location Sharing"
            description="Allow hospitals to see your exact distance to optimize emergency routing."
            checked={settings.sharePreciseLocation}
            onToggle={() => handleToggle('sharePreciseLocation')}
          />
          <SettingRow
            icon={<Navigation className="w-5 h-5 text-foreground" />}
            title="Dynamic Background Location"
            description="Receive alerts for emergencies near your LIVE location when you are away from home. Requires continuous background location tracking."
            checked={settings.liveLocationSync}
            onToggle={() => handleToggle('liveLocationSync')}
          />
        </div>
      </section>

      {/* Section 4: Availability (Do Not Disturb) */}
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
              Temporarily Suspend Pings
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              Turn this on if you are sick, traveling, or otherwise unable to
              donate. You will not receive emergency alerts until this is
              disabled.
            </p>
            {settings.doNotDisturb && (
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-yellow-500/10 text-yellow-700 dark:text-yellow-500 border border-yellow-500/20 rounded-md text-xs font-medium mb-2">
                <AlertTriangle className="w-4 h-4" />
                Account currently suspended from emergency dispatch.
              </div>
            )}
          </div>
          <div className="shrink-0 mt-1">
            <CustomToggle
              checked={settings.doNotDisturb}
              onChange={() => handleToggle('doNotDisturb')}
              dangerMode={true}
            />
          </div>
        </div>
      </section>

      {/* Section 5: Security */}
      <section className="space-y-4">
        <div className="flex items-center gap-2 mb-4">
          <Key className="w-5 h-5 text-muted-foreground" />
          <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">
            Security
          </h2>
        </div>

        <div className="bg-card border border-border rounded-xl p-5 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-sm font-medium text-foreground">Password</h3>
            <p className="text-sm text-muted-foreground">
              Last changed 4 months ago
            </p>
          </div>
          <button className="px-4 py-2 bg-secondary text-secondary-foreground border border-border rounded-md text-sm font-medium hover:bg-secondary/80 transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2">
            Change Password
          </button>
        </div>
      </section>

      {/* Action Footer */}
      <div className="pt-6 border-t border-border flex items-center justify-end gap-3 sticky bottom-0 bg-background/80 backdrop-blur-md pb-4 z-10">
        <button
          type="button"
          onClick={() => router.back()}
          disabled={isSaving}
          className="px-5 py-2.5 rounded-md text-sm font-medium text-foreground hover:bg-secondary transition-colors disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={handleSave}
          disabled={isSaving}
          className="inline-flex items-center justify-center px-6 py-2.5 rounded-md bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:opacity-50 shadow-sm"
        >
          {isSaving ? (
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
    </div>
  );
}

// --- Helper Components ---

function SettingRow({
  icon,
  title,
  description,
  checked,
  onToggle,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  checked: boolean;
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
        <CustomToggle checked={checked} onChange={onToggle} />
      </div>
    </div>
  );
}

// Fixed toggle component: perfectly centered circle, no clipping, proper margins
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
