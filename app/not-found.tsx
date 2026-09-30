'use client';

import Link from 'next/link';
import { AlertCircle, ArrowLeft, Home } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans">
      <Header />

      <main className="flex-1 flex items-center justify-center p-6 relative overflow-hidden">
        {/* Subtle background pattern */}
        <div className="absolute inset-0 z-0 bg-[linear-gradient(to_right,var(--color-border)_1px,transparent_1px),linear-gradient(to_bottom,var(--color-border)_1px,transparent_1px)] bg-[size:3rem_3rem] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_50%,#000_20%,transparent_100%)] opacity-20 pointer-events-none" />

        <div className="relative z-10 w-full max-w-md bg-card border border-border rounded-xl p-8 shadow-sm text-center">
          {/* Simple Icon */}
          <div className="w-12 h-12 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary mx-auto mb-6">
            <AlertCircle className="w-6 h-6" />
          </div>

          {/* Simple Code/Badge */}
          <div className="font-mono text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-2">
            Error 404
          </div>

          <h1 className="text-2xl font-semibold tracking-tight text-foreground mb-2">
            Page not found
          </h1>

          <p className="text-sm text-muted-foreground leading-relaxed mb-8">
            The page you are looking for doesn&apos;t exist or may have been
            moved. Let&apos;s get you back on track.
          </p>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/"
              className="w-full sm:w-auto inline-flex items-center justify-center h-10 px-4 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors shadow-sm"
            >
              <Home className="w-4 h-4 mr-2" />
              Go to Home
            </Link>

            <button
              onClick={() => window.history.back()}
              className="w-full sm:w-auto inline-flex items-center justify-center h-10 px-4 rounded-md bg-secondary border border-border text-foreground text-sm font-medium hover:bg-secondary/80 transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Go Back
            </button>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
