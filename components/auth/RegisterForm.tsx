'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Activity, MessageSquare, LocateFixed, Loader2 } from 'lucide-react';

const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

export default function RegisterForm() {
  const [tab, setTab] = useState<'donor' | 'hospital'>('donor');
  const [location, setLocation] = useState('');
  const [isLocating, setIsLocating] = useState(false);

  // Optional: Add an error state for backend validation messages
  // const [error, setError] = useState<string | null>(null);
  // const [isLoading, setIsLoading] = useState(false);

  const router = useRouter();

  async function handleSubmit(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();

    // ==========================================
    // BACKEND INTEGRATION INSTRUCTIONS
    // ==========================================

    // 1. Extract all form inputs using the native FormData API
    // const formData = new FormData(e.currentTarget);
    // const data = Object.fromEntries(formData.entries());

    // 2. Combine the form data with our custom state variables (role & location)
    // const payload = {
    //   ...data,
    //   role: tab,
    //   coordinates: location
    // };

    // 3. Send the POST request to your Express/Node backend
    /*
    try {
      setIsLoading(true);
      setError(null);
      
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Registration failed');
      }

      // 4. On success, save JWT token (if applicable) and route to dashboard
      // const { token } = await res.json();
      // localStorage.setItem('pulse_token', token); // Or use secure HttpOnly cookies
      
      router.push(tab === 'donor' ? '/donor/dashboard' : '/hospital/dashboard');
      
    } catch (err: any) {
      setError(err.message);
      console.error("Registration Error:", err);
    } finally {
      setIsLoading(false);
    }
    */

    // --- TEMPORARY MOCK REDIRECT (Remove this when backend is active) ---
    router.push(tab === 'donor' ? '/donor/dashboard' : '/hospital/dashboard');
  }

  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser');
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude.toFixed(6);
        const lng = position.coords.longitude.toFixed(6);
        setLocation(`${lat}, ${lng}`);
        setIsLocating(false);
      },
      (error) => {
        console.error('Location error:', error);
        alert(
          'Failed to acquire satellite lock. Please enter location manually.',
        );
        setIsLocating(false);
      },
      { enableHighAccuracy: true },
    );
  };

  return (
    <div className="w-full max-w-lg bg-card border border-border rounded-xl p-8 shadow-sm">
      <div className="mb-8 text-center flex flex-col items-center">
        <div className="w-10 h-10 rounded-md bg-primary/10 border border-primary/20 flex items-center justify-center mb-4">
          <Activity className="w-5 h-5 text-primary" />
        </div>
        <h1 className="font-semibold tracking-tight text-2xl text-foreground mb-1">
          Network Registration
        </h1>
        <p className="text-sm text-muted-foreground">
          Initialize your profile on the Pulse network
        </p>
      </div>

      <div className="mb-8">
        <label className="text-xs font-mono uppercase tracking-widest text-muted-foreground block mb-2 text-center">
          Entity Type
        </label>
        <div className="flex p-1 gap-1 bg-secondary border border-border rounded-lg">
          <button
            type="button"
            onClick={() => setTab('donor')}
            className={`flex-1 text-xs font-medium py-2 rounded-md transition-all uppercase tracking-wider ${
              tab === 'donor'
                ? 'bg-background text-foreground shadow-sm border border-border/50'
                : 'text-muted-foreground hover:text-foreground hover:bg-background/50 border border-transparent'
            }`}
          >
            Donor
          </button>
          <button
            type="button"
            onClick={() => setTab('hospital')}
            className={`flex-1 text-xs font-medium py-2 rounded-md transition-all uppercase tracking-wider ${
              tab === 'hospital'
                ? 'bg-background text-foreground shadow-sm border border-border/50'
                : 'text-muted-foreground hover:text-foreground hover:bg-background/50 border border-transparent'
            }`}
          >
            Hospital
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        {tab === 'donor' ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {/* Added 'name' props to all Fields to support FormData extraction */}
              <Field
                name="fullName"
                label="Full Name"
                type="text"
                placeholder="Kamal Perera"
              />
              <Field
                name="dob"
                label="Date of Birth"
                type="date"
                placeholder=""
              />
            </div>

            <Field
              name="email"
              label="Email Address"
              type="email"
              placeholder="kamal@example.lk"
            />
            <Field
              name="password"
              label="Password"
              type="password"
              placeholder="••••••••"
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="space-y-2">
                <label className="text-xs font-medium text-foreground block">
                  Blood Group
                </label>
                <select
                  name="bloodGroup"
                  required
                  defaultValue=""
                  className="w-full h-10 px-3 rounded-md border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-primary transition-all appearance-none"
                >
                  <option value="" disabled className="text-muted-foreground">
                    Select group
                  </option>
                  {bloodGroups.map((g) => (
                    <option key={g} value={g}>
                      {g}
                    </option>
                  ))}
                </select>
              </div>
              <Field
                name="phone"
                label="Phone (SMS Alerts)"
                type="tel"
                placeholder="+94 77 123 4567"
              />
            </div>

            <LocationField
              label="Location / Coordinates"
              placeholder="Nugegoda, Colombo"
              value={location}
              onChange={setLocation}
              onLocate={handleGetLocation}
              isLocating={isLocating}
            />

            <div className="flex items-start gap-3 rounded-md border border-border bg-secondary/50 p-4 mt-2">
              <MessageSquare className="w-5 h-5 text-primary shrink-0 mt-0.5" />
              <p className="text-xs text-muted-foreground leading-relaxed">
                You will receive an{' '}
                <span className="font-medium text-foreground">
                  SMS notification
                </span>{' '}
                whenever your blood type is needed in your geo-radius. Before
                your first donation, your medical eligibility must be{' '}
                <span className="font-medium text-foreground">
                  verified by clinical staff
                </span>
                .
              </p>
            </div>
          </>
        ) : (
          <>
            <Field
              name="hospitalName"
              label="Hospital Name"
              type="text"
              placeholder="Nawaloka Hospital"
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <Field
                name="registrationNumber"
                label="Registration Number"
                type="text"
                placeholder="LK/2018/04521"
              />
              <Field
                name="contactPerson"
                label="Contact Person"
                type="text"
                placeholder="Dr. Nimali Fernando"
              />
            </div>
            <Field
              name="email"
              label="Email Address"
              type="email"
              placeholder="admin@nawaloka.lk"
            />
            <Field
              name="password"
              label="Password"
              type="password"
              placeholder="••••••••"
            />
            <Field
              name="dispatchPhone"
              label="Emergency Dispatch Phone"
              type="tel"
              placeholder="+94 11 254 4444"
            />

            <LocationField
              label="Facility Coordinates"
              placeholder="Deshamanya Mw, Colombo 02"
              value={location}
              onChange={setLocation}
              onLocate={handleGetLocation}
              isLocating={isLocating}
            />
          </>
        )}

        <button
          type="submit"
          className="w-full h-10 mt-4 rounded-md bg-primary text-primary-foreground text-sm font-semibold hover:bg-red-700 transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background"
        >
          Create Account
        </button>
      </form>

      <div className="mt-8 pt-6 border-t border-border text-center">
        <p className="text-sm text-muted-foreground">
          Already integrated?{' '}
          <Link
            href="/login"
            className="text-foreground font-medium hover:text-primary transition-colors hover:underline underline-offset-4"
          >
            Authenticate here
          </Link>
        </p>
      </div>
    </div>
  );
}

// Added 'name' prop to Field component
function Field({
  name,
  label,
  type,
  placeholder,
}: {
  name: string;
  label: string;
  type: string;
  placeholder: string;
}) {
  return (
    <div className="space-y-2">
      <label className="text-xs font-medium text-foreground block">
        {label}
      </label>
      <input
        name={name}
        type={type}
        placeholder={placeholder}
        required
        className="w-full h-10 px-3 rounded-md border border-border bg-background text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-primary transition-all"
      />
    </div>
  );
}

function LocationField({
  label,
  placeholder,
  value,
  onChange,
  onLocate,
  isLocating,
}: {
  label: string;
  placeholder: string;
  value: string;
  onChange: (val: string) => void;
  onLocate: () => void;
  isLocating: boolean;
}) {
  return (
    <div className="space-y-2">
      <label className="text-xs font-medium text-foreground block">
        {label}
      </label>
      <div className="flex gap-2">
        <input
          type="text"
          placeholder={placeholder}
          required
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="flex-1 h-10 px-3 rounded-md border border-border bg-background text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-primary transition-all font-mono"
        />
        <button
          type="button"
          onClick={onLocate}
          disabled={isLocating}
          className="shrink-0 flex items-center justify-center w-10 h-10 rounded-md border border-border bg-secondary text-muted-foreground hover:text-primary hover:border-primary transition-all focus:outline-none focus:ring-2 focus:ring-ring focus:border-primary disabled:opacity-50"
          title="Acquire Live Coordinates"
        >
          {isLocating ? (
            <Loader2 className="w-4 h-4 animate-spin text-primary" />
          ) : (
            <LocateFixed className="w-4 h-4" />
          )}
        </button>
      </div>
    </div>
  );
}
