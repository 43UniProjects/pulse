'use client';

import { useState, useActionState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Activity, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { authenticateUser } from './actions';

export default function LoginForm() {
  const router = useRouter();
  const [role, setRole] = useState<'donor' | 'hospital' | 'admin'>('donor');
  const [state, formAction, isPending] = useActionState(authenticateUser, null);
  const lastStateRef = useRef(state);

  // Trigger Sonner toast notifications for global states
  useEffect(() => {
    if (state === lastStateRef.current) return;
    lastStateRef.current = state;

    if (state?.success) {
      toast.success('Logged in successfully!');
      if (state.redirectUrl) {
        setTimeout(() => router.push(state.redirectUrl!), 800);
      }
    } else if (state?.error && !state?.fieldErrors) {
      toast.error(state.error);
    }
  }, [state, router]);

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

      <form action={formAction} className="flex flex-col gap-5">
        <input type="hidden" name="role" value={role} />

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
          {state?.fieldErrors?.role && (
            <p className="text-xs text-red-500 mt-2">
              {state.fieldErrors.role[0]}
            </p>
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
          {state?.fieldErrors?.email && (
            <p className="text-xs text-red-500">{state.fieldErrors.email[0]}</p>
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
          {state?.fieldErrors?.password && (
            <p className="text-xs text-red-500">
              {state.fieldErrors.password[0]}
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={isPending}
          className="w-full h-10 mt-2 flex items-center justify-center rounded-md bg-primary text-primary-foreground text-sm font-semibold hover:bg-red-700 transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background disabled:opacity-50 disabled:cursor-not-allowed"
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
