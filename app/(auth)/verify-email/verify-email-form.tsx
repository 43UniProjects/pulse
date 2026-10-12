'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { MailCheck, Loader2, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { authClient } from '@/lib/auth/client';

export default function VerifyEmailForm() {
  const searchParams = useSearchParams();
  const initialEmail = searchParams.get('email') || '';

  const [email, setEmail] = useState(initialEmail);
  const [isResending, setIsResending] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  // Cooldown countdown timer to prevent SMTP rate-limiting
  useEffect(() => {
    if (cooldown <= 0) return;

    const timer = setInterval(() => {
      setCooldown((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [cooldown]);

  const handleResendEmail = async () => {
    const trimmedEmail = email.trim();

    if (!trimmedEmail) {
      toast.error('Please provide an email address to resend verification.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      toast.error('Please provide a valid email address.');
      return;
    }

    setIsResending(true);

    try {
      const { error } = await authClient.sendVerificationEmail({
        email: trimmedEmail,
        callbackURL: '/login?verified=true',
      });

      if (error) {
        toast.error(error.message || 'Failed to resend confirmation email.');
        return;
      }

      toast.success('Verification link resent! Please check your inbox.');
      setCooldown(60); // 60-second cooldown
    } catch {
      toast.error('An unexpected network error occurred.');
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="w-full max-w-lg bg-card border border-border rounded-xl p-8 shadow-sm">
      <div className="mb-8 text-center flex flex-col items-center">
        <div className="w-16 h-16 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center mb-6">
          <MailCheck className="w-8 h-8 text-primary" />
        </div>
        <h1 className="font-semibold tracking-tight text-2xl text-foreground mb-2">
          Check your inbox
        </h1>
        <p className="text-sm text-muted-foreground leading-relaxed max-w-sm">
          We sent a verification link to your email. Click the link inside to
          activate your account.
        </p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <label className="text-xs font-medium text-foreground block">
            Didn&apos;t receive it? Verify your email address:
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="w-full h-10 px-3 rounded-md border border-border bg-background text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-primary transition-all"
          />
        </div>

        <button
          type="button"
          disabled={isResending || cooldown > 0}
          onClick={handleResendEmail}
          className="w-full h-10 flex items-center justify-center rounded-md bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isResending ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Sending...
            </>
          ) : cooldown > 0 ? (
            `Resend in ${cooldown}s`
          ) : (
            'Resend Verification Link'
          )}
        </button>
      </div>

      <div className="mt-8 pt-6 border-t border-border text-center">
        <Link
          href="/login"
          className="inline-flex items-center justify-center text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Return to Login
        </Link>
      </div>
    </div>
  );
}
