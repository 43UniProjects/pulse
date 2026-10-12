'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useTheme } from 'next-themes';
import { useRouter } from 'next/navigation';
import {
  Sun,
  Moon,
  LayoutDashboard,
  ChevronDown,
  User,
  LogOut,
} from 'lucide-react';

import MobileMenu from './mobile-menu';
import { NAV_LINKS } from '@/types/common.type';
import { authClient } from '@/lib/auth/client';

export default function Header() {
  const { theme, setTheme } = useTheme();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const { data: session, isPending } = authClient.useSession();

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  const dashboardHref = session?.user?.role
    ? `/${session.user.role}/dashboard`
    : '/login';

  const handleLogout = async () => {
    setIsProfileOpen(false);
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          router.refresh();
          router.push('/login');
        },
      },
    });
  };

  return (
    <header className="sticky top-0 z-50 w-full flex flex-col shadow-sm transform-gpu">
      {/* Top Bar */}
      <div className="bg-background/80 backdrop-blur-md border-b border-border py-1.5 w-full">
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between text-xs font-medium text-muted-foreground">
          <div className="hidden sm:flex items-center gap-2">
            Real-Time Emergency Blood Network
          </div>

          <div className="flex items-center justify-end gap-4 w-full sm:w-auto">
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
            <ul className="hidden sm:flex items-center gap-6">
              {/* Filter out duplicates if NAV_LINKS already has Login/Register */}
              {NAV_LINKS.filter((link) => {
                if (session && link.label === 'Home') return false;
                if (link.label === 'Login' || link.label === 'Register')
                  return false;
                return true;
              }).map(({ label, href }) => (
                <li key={href}>
                  <Link
                    href={href}
                    className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {label}
                  </Link>
                </li>
              ))}

              {/* Dynamic Role-Based Authentication UI */}
              {isPending ? (
                <li className="flex items-center gap-4 pl-4 border-l border-border/50">
                  <div className="w-20 h-5 bg-secondary rounded-md animate-pulse" />
                  <div className="w-28 h-9 bg-secondary rounded-md animate-pulse" />
                </li>
              ) : session ? (
                <li className="flex items-center gap-4 pl-4 border-l border-border/50">
                  <div className="relative">
                    <button
                      onClick={() => setIsProfileOpen(!isProfileOpen)}
                      className="flex items-center gap-1.5 text-sm font-medium text-foreground hover:text-primary transition-colors focus:outline-none"
                    >
                      Hi, {session.user.name}
                      <ChevronDown
                        className={`w-4 h-4 transition-transform ${isProfileOpen ? 'rotate-180' : ''}`}
                      />
                    </button>

                    {isProfileOpen && (
                      <>
                        <div
                          className="fixed inset-0 z-40"
                          onClick={() => setIsProfileOpen(false)}
                        />
                        <div className="absolute right-0 mt-3 w-48 bg-card border border-border rounded-md shadow-lg z-50 py-1 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                          <Link
                            href={`/${session.user.role}/profile`}
                            onClick={() => setIsProfileOpen(false)}
                            className="flex items-center px-4 py-2.5 text-sm text-foreground hover:bg-secondary transition-colors"
                          >
                            <User className="w-4 h-4 mr-2" /> Visit Profile
                          </Link>
                          <div className="h-px bg-border my-1" />
                          <button
                            onClick={handleLogout}
                            className="w-full flex items-center px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors"
                          >
                            <LogOut className="w-4 h-4 mr-2" /> Logout
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                  <Link
                    href={dashboardHref}
                    className="inline-flex items-center justify-center h-9 px-4 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors shadow-sm"
                  >
                    <LayoutDashboard className="w-4 h-4 mr-2" /> Dashboard
                  </Link>
                </li>
              ) : (
                <li className="flex items-center gap-4 pl-4 border-l border-border/50">
                  <Link
                    href="/login"
                    className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Login
                  </Link>
                  <Link
                    href="/register"
                    className="inline-flex items-center justify-center h-9 px-4 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors shadow-sm"
                  >
                    Register
                  </Link>
                </li>
              )}
            </ul>
            <div className="sm:hidden">
              <MobileMenu session={session} dashboardHref={dashboardHref} />
            </div>
          </nav>
        </div>
      </div>
    </header>
  );
}
