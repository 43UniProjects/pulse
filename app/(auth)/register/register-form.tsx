'use client';

import { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { Activity, Loader2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

import GenericFallback from '@/components/fallback';
import { ACCOUNT_TYPE, AccountType } from './types';
import { registerSchema } from '../_validators/auth.schema';
import { authClient } from '@/lib/auth/client';

function RegisterFormContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Initialize directly from URL params if present
  const initialType = searchParams.get('type');
  const [tab, setTab] = useState<AccountType>(
    initialType === ACCOUNT_TYPE[1] ? ACCOUNT_TYPE[1] : ACCOUNT_TYPE[0],
  );

  const [isPending, setIsPending] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [globalError, setGlobalError] = useState<string | null>(null);

  // Sync State -> URL when tab changes
  const handleTabChange = (newTab: AccountType) => {
    setTab(newTab);
    const params = new URLSearchParams(searchParams.toString());
    params.set('type', newTab);
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsPending(true);
    setFieldErrors({});
    setGlobalError(null);

    const formData = new FormData(e.currentTarget);
    const rawData = Object.fromEntries(formData.entries());
    rawData.role = tab;

    const validation = registerSchema.safeParse(rawData);

    if (!validation.success) {
      const errors: Record<string, string[]> = {};
      validation.error.issues.forEach((issue) => {
        const field = String(issue.path[0]);
        if (!errors[field]) errors[field] = [];
        errors[field].push(issue.message);
      });

      setFieldErrors(errors);
      toast.error('Please fix the errors in the form.');
      setIsPending(false);
      return;
    }

    const { email, password, username, role } = validation.data;

    type BaseSignUpParams = Parameters<typeof authClient.signUp.email>[0];
    type CustomSignUpParams = BaseSignUpParams & {
      role: string;
      isActive: boolean;
    };

    const { error } = await authClient.signUp.email({
      email,
      password,
      name: username,
      role: role,
      isActive: false,
    } as CustomSignUpParams);

    if (error) {
      setGlobalError(error.message || 'Registration failed.');
      toast.error(error.message || 'Failed to create account.');
      setIsPending(false);
      return;
    }

    toast.success('Account created! Please check your email.');
    router.push(`/verify-email?email=${encodeURIComponent(email)}`);
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
            onClick={() => handleTabChange(ACCOUNT_TYPE[0])}
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
            onClick={() => handleTabChange(ACCOUNT_TYPE[1])}
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

      <form onSubmit={handleRegister} className="flex flex-col gap-5">
        <Field
          name="username"
          label="Username"
          type="text"
          placeholder={tab === 'donor' ? 'kamal99' : 'nawaloka_admin'}
          error={fieldErrors.username?.[0]}
        />
        <Field
          name="email"
          label="Email Address"
          type="email"
          placeholder={
            tab === 'donor' ? 'kamal@example.lk' : 'admin@nawaloka.lk'
          }
          error={fieldErrors.email?.[0]}
        />
        <Field
          name="password"
          label="Password"
          type="password"
          placeholder="••••••••"
          error={fieldErrors.password?.[0]}
        />
        <Field
          name="confirmPassword"
          label="Confirm Password"
          type="password"
          placeholder="••••••••"
          error={fieldErrors.confirmPassword?.[0]}
        />

        {globalError && (
          <div className="flex items-start gap-2 p-3 mt-2 text-sm text-red-600 bg-red-50 border border-red-100 rounded-md">
            <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
            <p>{globalError}</p>
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
