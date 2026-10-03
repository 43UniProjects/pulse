import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="border-t border-border py-8 bg-secondary/90">
      <div className="max-w-7xl mx-auto px-6 flex flex-row flex-wrap items-center justify-center gap-8 sm:gap-12 text-xs text-muted-foreground">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-foreground">Pulse</span>
          <span>—&nbsp; Real-Time Emergency Blood Network</span>
        </div>
        <div>© 2026 Pulse Emergency Network. All rights reserved.</div>
        <div className="flex items-center gap-4">
          <Link
            href="/privacy"
            className="hover:text-foreground transition-colors"
          >
            Privacy
          </Link>
          <Link
            href="/terms"
            className="hover:text-foreground transition-colors"
          >
            Terms
          </Link>
        </div>
      </div>
    </footer>
  );
}
