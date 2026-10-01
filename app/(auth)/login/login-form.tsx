'use client';

import { useState, useActionState } from 'react';
import Link from 'next/link';
import { Activity, Loader2, AlertCircle } from 'lucide-react';
import { authenticateUser } from './actions';

export default function LoginForm() {
  const [role, setRole] = useState<'donor' | 'hospital' | 'admin'>('donor');

  const [state, formAction, isPending] = useActionState(authenticateUser, null);

  return (
    <div className="w-full max-w-sm bg-card border border-border rounded-xl p-8 shadow-sm">
      <div className="mb-8 text-center flex flex-col items-center">
        <div className="w-10 h-10 rounded-md bg-primary/10 border border-primary/20 flex items-center justify-center mb-4">
          <Activity className="w-5 h-5 text-primary" />
        </div>
        <h1 className="font-semibold tracking-tight text-2xl text-foreground mb-1">
          System Authentication
        </h1>
        <p className="text-sm text-muted-foreground">
          Enter your credentials to access Pulse
        </p>
      </div>

      <form action={formAction} className="flex flex-col gap-5">
        {/* Hidden input to pass the role state into FormData */}
        <input type="hidden" name="role" value={role} />

        {/* Role Selector */}
        <div>
          <label className="text-xs font-mono uppercase tracking-widest text-muted-foreground block mb-2">
            Access Level
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
        </div>

        <div className="space-y-2">
          <label className="text-xs font-medium text-foreground block">
            Email Address
          </label>
          <input
            name="email"
            type="email"
            required
            placeholder="you@example.com"
            className="w-full h-10 px-3 rounded-md border border-border bg-background text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-primary transition-all"
          />
        </div>

        <div className="space-y-2">
          <label className="text-xs font-medium text-foreground block">
            Password
          </label>
          <input
            name="password"
            type="password"
            required
            placeholder="••••••••"
            className="w-full h-10 px-3 rounded-md border border-border bg-background text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-primary transition-all"
          />
        </div>

        {/* Error Banner */}
        {state?.error && (
          <div className="flex items-start gap-2 p-3 text-sm text-red-600 bg-red-50 border border-red-100 rounded-md">
            <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
            <p>{state.error}</p>
          </div>
        )}

        <button
          type="submit"
          disabled={isPending}
          className="w-full h-10 mt-2 flex items-center justify-center rounded-md bg-primary text-primary-foreground text-sm font-semibold hover:bg-red-700 transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isPending ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Authenticating...
            </>
          ) : (
            'Initialize Session'
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
