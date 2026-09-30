'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Activity } from 'lucide-react';

export default function LoginForm() {
  const router = useRouter();
  const [role, setRole] = useState<'donor' | 'hospital' | 'admin'>('donor');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  function handleSubmit(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();

    if (role === 'donor') router.push('/donor/dashboard');
    else if (role === 'hospital') router.push('/hospital/dashboard');
    else router.push('/admin/dashboard');
  }

  return (
    <div className="w-full max-w-sm bg-card border border-border rounded-xl p-8 shadow-sm">
      {/* Header */}
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

      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        {/* Role Selector (Segmented Control Style) */}
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

        {/* Email Input */}
        <div className="space-y-2">
          <label className="text-xs font-medium text-foreground block">
            Email Address
          </label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="w-full h-10 px-3 rounded-md border border-border bg-background text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-primary transition-all"
          />
        </div>

        {/* Password Input */}
        <div className="space-y-2">
          <label className="text-xs font-medium text-foreground block">
            Password
          </label>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="w-full h-10 px-3 rounded-md border border-border bg-background text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-primary transition-all"
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className="w-full h-10 mt-2 rounded-md bg-primary text-primary-foreground text-sm font-semibold hover:bg-red-700 transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background"
        >
          Initialize Session
        </button>
      </form>

      {/* Footer link */}
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
