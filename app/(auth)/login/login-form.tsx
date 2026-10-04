'use client';

import { useState, useActionState, useEffect } from 'react';
import Link from 'next/link';
import { Activity, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { authenticateUser } from './actions';
import { loginSchema, userRoleEnum } from './login.schema';
import { z } from 'zod';

type UserRole = z.infer<typeof userRoleEnum>;

export default function LoginForm() {
  const [role, setRole] = useState<UserRole>('donor');
  const [state, formAction, isPending] = useActionState(authenticateUser, null);
  const [clientErrors, setClientErrors] = useState<{
    email?: string;
    password?: string;
  }>({});

  // Trigger Sonner toast for server-side errors
  useEffect(() => {
    if (state?.error) {
      toast.error(state.error);
    }
  }, [state?.error]);

  // Client-side form validation before submitting to server action
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    const form = e.currentTarget;
    const formData = new FormData(form);

    const validationResult = loginSchema.safeParse({
      role,
      email: formData.get('email'),
      password: formData.get('password'),
    });

    if (!validationResult.success) {
      e.preventDefault();

      const errors: { email?: string; password?: string } = {};
      for (const issue of validationResult.error.issues) {
        const field = issue.path[0] as 'email' | 'password';
        if (field && !errors[field]) {
          errors[field] = issue.message;
        }
      }
      setClientErrors(errors);

      const firstErrorMessage =
        validationResult.error.issues[0]?.message ||
        'Please check your inputs.';
      toast.error(firstErrorMessage);
      return;
    }

    setClientErrors({});
  };

  return (
    <div className="w-full max-w-lg bg-card border border-border rounded-xl p-8 shadow-sm relative">
      <div className="mb-8 text-center flex flex-col items-center">
        <div className="w-10 h-10 rounded-md bg-primary/10 border border-primary/20 flex items-center justify-center mb-4">
          <Activity className="w-5 h-5 text-primary" />
        </div>
        <h1 className="font-semibold tracking-tight text-2xl text-foreground mb-1">
          Login
        </h1>
        <p className="text-sm text-muted-foreground">Sign in to your account</p>
      </div>

      <form
        action={formAction}
        onSubmit={handleSubmit}
        noValidate
        className="flex flex-col gap-5"
      >
        {/* Hidden input to pass the role state into FormData */}
        <input type="hidden" name="role" value={role} />

        {/* Role Selector */}
        <div>
          <label className="text-xs font-mono uppercase tracking-widest text-muted-foreground block mb-2">
            Account Type
          </label>
          <div className="flex p-1 gap-1 bg-secondary border border-border rounded-lg">
            {(['donor', 'hospital', 'admin'] as const).map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => {
                  setRole(r);
                  setClientErrors({});
                }}
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
          <label
            htmlFor="email"
            className="text-xs font-medium text-foreground block"
          >
            Email Address
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            aria-invalid={!!clientErrors.email}
            aria-describedby={clientErrors.email ? 'email-error' : undefined}
            onChange={() => {
              if (clientErrors.email) {
                setClientErrors((prev) => ({ ...prev, email: undefined }));
              }
            }}
            className={`w-full h-10 px-3 rounded-md border bg-background text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-primary transition-all ${
              clientErrors.email
                ? 'border-red-500 ring-1 ring-red-500'
                : 'border-border'
            }`}
          />
          {clientErrors.email && (
            <p id="email-error" className="text-xs text-red-500 font-medium">
              {clientErrors.email}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <label
            htmlFor="password"
            className="text-xs font-medium text-foreground block"
          >
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            placeholder="••••••••"
            aria-invalid={!!clientErrors.password}
            aria-describedby={
              clientErrors.password ? 'password-error' : undefined
            }
            onChange={() => {
              if (clientErrors.password) {
                setClientErrors((prev) => ({ ...prev, password: undefined }));
              }
            }}
            className={`w-full h-10 px-3 rounded-md border bg-background text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-primary transition-all ${
              clientErrors.password
                ? 'border-red-500 ring-1 ring-red-500'
                : 'border-border'
            }`}
          />
          {clientErrors.password && (
            <p id="password-error" className="text-xs text-red-500 font-medium">
              {clientErrors.password}
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
