'use client';

import { useState, useEffect, useRef, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Activity, Loader2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

import { authClient } from '@/lib/auth/client';
import { loginSchema } from '../_validators/auth.schema';
import GenericFallback from '@/components/fallback';

function LoginFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const { data: session } = authClient.useSession();
  const verifiedToastShown = useRef(false);
  const redirectInitiated = useRef(false);

  const [role, setRole] = useState<'donor' | 'hospital' | 'admin'>('donor');
  const [isPending, setIsPending] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [globalError, setGlobalError] = useState<string | null>(null);

  // Automatically redirect authenticated users (e.g. after email verification) to their dashboard
  useEffect(() => {
    if (session?.user && !redirectInitiated.current) {
      redirectInitiated.current = true;
      const userRole = session.user.role || 'donor';
      const isVerified = searchParams.get('verified') === 'true';
      router.replace(
        `/${userRole}/dashboard${isVerified ? '?verified=true' : ''}`,
      );
    }
  }, [session, searchParams, router]);

  // Detect successful email verification redirect for unauthenticated users (single toast guaranteed)
  useEffect(() => {
    if (
      searchParams.get('verified') === 'true' &&
      !session?.user &&
      !verifiedToastShown.current
    ) {
      verifiedToastShown.current = true;
      toast.success('Email verified successfully! You can now log in.', {
        id: 'email-verified-toast',
      });
      router.replace('/login', { scroll: false });
    }
  }, [searchParams, session, router]);

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsPending(true);
    setFieldErrors({});
    setGlobalError(null);

    const formData = new FormData(e.currentTarget);
    const rawData = Object.fromEntries(formData.entries());

    rawData.role = role;

    const validation = loginSchema.safeParse(rawData);

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

    const { email, password } = validation.data;

    const { data, error } = await authClient.signIn.email({
      email,
      password,
    });

    if (error) {
      setGlobalError(error.message || 'Invalid credentials.');
      toast.error(error.message || 'Failed to sign in');
      setIsPending(false);
      return;
    }

    toast.success('Logged in successfully!');

    const userRole = data?.user?.role;

    if (userRole === 'donor') {
      router.push('/donor/dashboard');
    } else if (userRole === 'hospital') {
      router.push('/hospital/dashboard');
    } else {
      router.push('/admin/dashboard');
    }
  };

  return (
    <div className="w-full max-w-lg bg-card border border-border rounded-xl p-8 shadow-sm">
      <div className="mb-8 text-center flex flex-col items-center">
        <div className="w-10 h-10 rounded-md bg-primary/10 border border-primary/20 flex items-center justify-center mb-4">
          <Activity className="w-5 h-5 text-primary" />
        </div>
        <h1 className="font-semibold tracking-tight text-2xl text-foreground mb-1">
          Login
        </h1>
        <p className="text-sm text-muted-foreground">Sign in to your account</p>
      </div>

      <form onSubmit={handleLogin} className="flex flex-col gap-5">
        <div>
          <label className="text-xs font-mono uppercase tracking-widest text-muted-foreground block mb-2">
            Account Type
          </label>
          <div className="flex p-1 gap-1 bg-secondary border border-border rounded-lg">
            {(['donor', 'hospital', 'admin'] as const).map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setRole(r)}
                className={`flex-1 text-xs font-medium py-2 rounded-md transition-all capitalize ${
                  role === r
                    ? 'bg-background text-foreground shadow-sm border border-border/50'
                    : 'text-muted-foreground hover:text-foreground hover:bg-background/50 border border-transparent'
                }`}
              >
                {r}
              </button>
            ))}
          </div>
          {fieldErrors.role && (
            <p className="text-xs text-red-500 mt-2">{fieldErrors.role[0]}</p>
          )}
        </div>

        <div className="space-y-2">
          <label className="text-xs font-medium text-foreground block">
            Email Address
          </label>
          <input
            name="email"
            type="email"
            placeholder="you@example.com"
            className="w-full h-10 px-3 rounded-md border border-border bg-background text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-primary transition-all"
          />
          {fieldErrors.email && (
            <p className="text-xs text-red-500">{fieldErrors.email[0]}</p>
          )}
        </div>

        <div className="space-y-2">
          <label className="text-xs font-medium text-foreground block">
            Password
          </label>
          <input
            name="password"
            type="password"
            placeholder="••••••••"
            className="w-full h-10 px-3 rounded-md border border-border bg-background text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-primary transition-all"
          />
          {fieldErrors.password && (
            <p className="text-xs text-red-500">{fieldErrors.password[0]}</p>
          )}
        </div>

        {globalError && (
          <div className="flex items-start gap-2 p-3 text-sm text-red-600 bg-red-50 border border-red-100 rounded-md">
            <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
            <p>{globalError}</p>
          </div>
        )}

        <button
          type="submit"
          disabled={isPending}
          className="w-full h-10 mt-2 flex items-center justify-center rounded-md bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isPending ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Logging in...
            </>
          ) : (
            'Login'
          )}
        </button>
      </form>

      <div className="mt-8 pt-6 border-t border-border text-center">
        <p className="text-sm text-muted-foreground">
          Don&apos;t have an account?{' '}
          <Link
            href="/register"
            className="text-foreground font-medium hover:text-primary transition-colors hover:underline underline-offset-4"
          >
            Register here
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function LoginForm() {
  return (
    <Suspense fallback={<GenericFallback />}>
      <LoginFormContent />
    </Suspense>
  );
}
