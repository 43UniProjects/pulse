'use client';

import { useState, useEffect, useActionState, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

import {
  Activity,
  MessageSquare,
  LocateFixed,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import GenericFallback from '@/components/fallback';

import { registerAccount } from './actions';

import { BLOOD_GROUPS } from '@/types/common.type';
import { ACCOUNT_TYPE, AccountType } from './types';

function RegisterFormContent() {
  const searchParams = useSearchParams();

  // Initialize states
  const [tab, setTab] = useState<AccountType>(ACCOUNT_TYPE[0]);
  const [location, setLocation] = useState('');
  const [isLocating, setIsLocating] = useState(false);

  // Wire up the Server Action
  const [state, formAction, isPending] = useActionState(registerAccount, null);

  // Synchronize tab state whenever the URL search parameter changes
  useEffect(() => {
    const type = searchParams.get('type');
    if (type === ACCOUNT_TYPE[0] || type === ACCOUNT_TYPE[1]) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setTab(type as AccountType);
    }
  }, [searchParams]);

  return (
    <div className="w-full max-w-lg bg-card border border-border rounded-xl p-8 shadow-sm">
      <div className="mb-8 text-center flex flex-col items-center">
        <div className="w-10 h-10 rounded-md bg-primary/10 border border-primary/20 flex items-center justify-center mb-4">
          <Activity className="w-5 h-5 text-primary" />
        </div>
        <h1 className="font-semibold tracking-tight text-2xl text-foreground mb-1">
          Register
        </h1>
        <p className="text-sm text-muted-foreground">
          Create your account on Pulse
        </p>
      </div>

      <div className="mb-8">
        <label className="text-xs font-mono uppercase tracking-widest text-muted-foreground block mb-2 text-center">
          Account Type
        </label>
        <div className="flex p-1 gap-1 bg-secondary border border-border rounded-lg">
          <button
            type="button"
            onClick={() => setTab(ACCOUNT_TYPE[0])}
            className={`flex-1 text-xs font-medium py-2 rounded-md transition-all uppercase tracking-wider ${
              tab === ACCOUNT_TYPE[0]
                ? 'bg-background text-foreground shadow-sm border border-border/50'
                : 'text-muted-foreground hover:text-foreground hover:bg-background/50 border border-transparent'
            }`}
          >
            Donor
          </button>
          <button
            type="button"
            onClick={() => setTab(ACCOUNT_TYPE[1])}
            className={`flex-1 text-xs font-medium py-2 rounded-md transition-all uppercase tracking-wider ${
              tab === ACCOUNT_TYPE[1]
                ? 'bg-background text-foreground shadow-sm border border-border/50'
                : 'text-muted-foreground hover:text-foreground hover:bg-background/50 border border-transparent'
            }`}
          >
            Hospital
          </button>
        </div>
      </div>

      <form
        action={formAction}
        className="flex flex-col gap-5"
        onSubmit={(e) => {
          const formData = new FormData(e.currentTarget);
          const password = formData.get('password') as string;
          const confirmPassword = formData.get('confirmPassword') as string;

          if (password.length < 8) {
            e.preventDefault();
            setClientError('Password must be at least 8 characters');
          } else if (password !== confirmPassword) {
            e.preventDefault();
            setClientError("Passwords don't match");
          } else {
            setClientError(null);
          }
        }}
      >
        {/* Hidden inputs to pass state variables to the Server Action */}
        <input type="hidden" name="role" value={tab} />

        <Field
          name="email"
          label="Email Address"
          type="email"
          placeholder={
            tab === 'donor' ? 'kamal@example.lk' : 'admin@nawaloka.lk'
          }
        />
        <Field
          name="password"
          label="Password"
          type="password"
          placeholder="••••••••"
        />
        <Field
          name="confirmPassword"
          label="Confirm Password"
          type="password"
          placeholder="••••••••"
        />

        {/* Error Banner */}
        {(clientError || state?.error) && (
          <div className="flex items-start gap-2 p-3 mt-2 text-sm text-red-600 bg-red-50 border border-red-100 rounded-md">
            <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
            <p>{clientError || state?.error}</p>
          </div>
        )}

        <button
          type="submit"
          disabled={isPending}
          className="w-full h-10 mt-4 flex items-center justify-center rounded-md bg-primary text-primary-foreground text-sm font-semibold hover:bg-red-700 transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isPending ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Creating Account...
            </>
          ) : (
            'Create Account'
          )}
        </button>
      </form>

      <div className="mt-8 pt-6 border-t border-border text-center">
        <p className="text-sm text-muted-foreground">
          Already have an account?{' '}
          <Link
            href="/login"
            className="text-foreground font-medium hover:text-primary transition-colors hover:underline underline-offset-4"
          >
            Login here
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function RegisterForm() {
  return (
    <Suspense fallback={<GenericFallback />}>
      <RegisterFormContent />
    </Suspense>
  );
}

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
