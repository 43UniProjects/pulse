import { Loader2 } from 'lucide-react';

export default function Loading() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center font-sans relative overflow-hidden">
      {/* Subtle background pattern */}
      <div className="absolute inset-0 z-0 bg-[linear-gradient(to_right,var(--color-border)_1px,transparent_1px),linear-gradient(to_bottom,var(--color-border)_1px,transparent_1px)] bg-[size:3rem_3rem] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,#000_30%,transparent_100%)] opacity-20 pointer-events-none" />

      <div className="relative z-10 flex flex-col items-center max-w-sm text-center px-6">
        {/* Simple Spinner Icon */}
        <div className="w-12 h-12 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary mb-5 shadow-sm">
          <Loader2 className="w-6 h-6 animate-spin" />
        </div>

        {/* Clean Message */}
        <h2 className="text-lg font-semibold tracking-tight text-foreground mb-1">
          Loading content...
        </h2>
        <p className="text-sm text-muted-foreground">
          Please wait a moment while we get things ready for you.
        </p>
      </div>
    </div>
  );
}
