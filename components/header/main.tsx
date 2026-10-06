'use client';

import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useTheme } from 'next-themes';
import { Sun, Moon } from 'lucide-react';

import MobileMenu from './mobile-menu';
import { NAV_LINKS } from '@/types/common.type';

export default function Header() {
  const { theme, setTheme } = useTheme();
  const pathname = usePathname();
  const isLoggedIn =
    pathname.startsWith('/admin') ||
    pathname.startsWith('/hospital') ||
    pathname.startsWith('/donor');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  return (
    <header className="sticky top-0 z-50 w-full flex flex-col shadow-sm">
      {/* Top Bar: System Status & Utility Links */}
      <div className="bg-background/80 backdrop-blur-md border-b border-border py-1.5 w-full">
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between text-xs font-medium text-muted-foreground">
          {/* Tagline: Hidden on mobile to prevent layout breaking */}
          <div className="hidden sm:flex items-center gap-2">
            Real-Time Emergency Blood Network
          </div>

          <div className="flex items-center justify-end gap-4 w-full sm:w-auto">
            {/* Theme Switcher: Reduced padding to p-1.5 to fit the thin top bar */}
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="p-1.5 rounded-md hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:ring-offset-background"
              aria-label="Toggle Theme"
            >
              {mounted ? (
                theme === 'dark' ? (
                  <Sun className="w-3.5 h-3.5" />
                ) : (
                  <Moon className="w-3.5 h-3.5" />
                )
              ) : (
                <div className="w-3.5 h-3.5 opacity-0" />
              )}
            </button>
            <Link
              href="/support"
              className="hover:text-foreground transition-colors"
            >
              Help Center
            </Link>
            <Link
              href="/contact"
              className="hover:text-foreground transition-colors"
            >
              Contact 24/7
            </Link>
          </div>
        </div>
      </div>

      {/* Navigation Bar */}
      <div className="border-b border-border bg-background/50 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <span className="font-semibold tracking-tight text-lg text-foreground">
              Pulse
            </span>
          </Link>

          <nav aria-label="Main" className="flex items-center gap-4 sm:gap-6">
            {/* Desktop links, generated from the shared config */}
            <ul className="hidden sm:flex items-center gap-6">
              {NAV_LINKS.filter((link) =>
                isLoggedIn ? link.label === 'Home' : true,
              ).map(({ label, href }) => (
                <li key={href}>
                  <Link
                    href={href}
                    className={
                      label === NAV_LINKS[2].label
                        ? 'hidden sm:inline-flex items-center justify-center h-9 px-4 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors shadow-sm focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background'
                        : 'text-sm font-medium text-muted-foreground hover:text-foreground transition-colors'
                    }
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
            <div className="sm:hidden">
              <MobileMenu />
            </div>
          </nav>
        </div>
      </div>
    </header>
  );
}
