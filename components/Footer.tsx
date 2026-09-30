import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="border-t border-border py-8 bg-background">
      <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-foreground">Pulse</span>
          <span>— Real-Time Emergency Blood Network</span>
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
