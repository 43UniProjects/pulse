'use client';

import { useState, useEffect, useActionState, Suspense, useRef } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';

import { Activity, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

import GenericFallback from '@/components/fallback';
import { registerAccount } from './actions';
import { ACCOUNT_TYPE, AccountType } from './types';
import { registerSchema } from '../_validators/auth.schema';

function RegisterFormContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [tab, setTab] = useState<AccountType>(ACCOUNT_TYPE[0]);
  const [clientErrors, setClientErrors] = useState<Record<string, string[]>>(
    {},
  );

  const [state, formAction, isPending] = useActionState(registerAccount, null);
  const lastStateRef = useRef(state);

  useEffect(() => {
    const type = searchParams.get('type');
    if (type === ACCOUNT_TYPE[0] || type === ACCOUNT_TYPE[1]) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setTab(type as AccountType);
    }
  }, [searchParams]);

  // Trigger Sonner toast notifications for global states
  useEffect(() => {
    if (state === lastStateRef.current) return;
    lastStateRef.current = state;

    if (state?.success) {
      toast.success('Account created successfully!');
      if (state.redirectUrl) {
        setTimeout(() => router.push(state.redirectUrl!), 800);
      }
    } else if (state?.error && !state?.fieldErrors) {
      toast.error(state.error);
    }
  }, [state, router]);

  const handleClientValidation = (e: React.FormEvent<HTMLFormElement>) => {
    const formData = new FormData(e.currentTarget);
    const rawData = Object.fromEntries(formData.entries());

    // Run Zod schema validation directly on the client before submitting
    const validation = registerSchema.safeParse(rawData);

    if (!validation.success) {
      e.preventDefault(); // Stop server request if client validation fails
      const errors = validation.error.flatten().fieldErrors;
      setClientErrors(errors as Record<string, string[]>);
      toast.error('Please fix the errors in the form.');
    } else {
      setClientErrors({}); // Clear errors to allow submission to formAction
    }
  };

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
        onSubmit={handleClientValidation}
        className="flex flex-col gap-5"
      >
        <input type="hidden" name="role" value={tab} />

        {/* Added username field to satisfy Zod registerSchema */}
        <Field
          name="username"
          label="Username"
          type="text"
          placeholder={tab === 'donor' ? 'kamal99' : 'nawaloka_admin'}
          error={
            clientErrors.username?.[0] || state?.fieldErrors?.username?.[0]
          }
        />
        <Field
          name="email"
          label="Email Address"
          type="email"
          placeholder={
            tab === 'donor' ? 'kamal@example.lk' : 'admin@nawaloka.lk'
          }
          error={clientErrors.email?.[0] || state?.fieldErrors?.email?.[0]}
        />
        <Field
          name="password"
          label="Password"
          type="password"
          placeholder="••••••••"
          error={
            clientErrors.password?.[0] || state?.fieldErrors?.password?.[0]
          }
        />
        <Field
          name="confirmPassword"
          label="Confirm Password"
          type="password"
          placeholder="••••••••"
          error={
            clientErrors.confirmPassword?.[0] ||
            state?.fieldErrors?.confirmPassword?.[0]
          }
        />

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
  error,
}: {
  name: string;
  label: string;
  type: string;
  placeholder: string;
  error?: string;
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
        className={`w-full h-10 px-3 rounded-md border bg-background text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-offset-1 transition-all ${
          error
            ? 'border-red-500 focus:ring-red-500'
            : 'border-border focus:ring-ring focus:border-primary'
        }`}
      />
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}
