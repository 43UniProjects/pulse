'use client';

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

interface HeaderProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  session?: any;
}

export default function Header({ session: initialSession }: HeaderProps = {}) {
  const { resolvedTheme, setTheme } = useTheme();

  // Secure client-side session fetching
  const { data: clientSession } = authClient.useSession();
  const session = clientSession !== undefined ? clientSession : initialSession;

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
              onClick={() =>
                setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')
              }
              className="p-1.5 rounded-md hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:ring-offset-background cursor-pointer"
              aria-label="Toggle Theme"
            >
              <Sun className="w-3.5 h-3.5 hidden dark:block" />
              <Moon className="w-3.5 h-3.5 block dark:hidden" />
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
              {session ? (
                <li className="flex items-center gap-4 pl-2 border-l border-border/50">
                  <Link
                    href={`/${session.user.role}/profile`}
                    className="text-sm font-medium text-foreground hover:text-primary transition-colors hover:underline underline-offset-4"
                  >
                    Hi, {session.user.name}
                  </Link>
                  <Link
                    href={dashboardHref}
                    className="inline-flex items-center justify-center h-9 px-4 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors shadow-sm"
                  >
                    <LayoutDashboard className="w-4 h-4 mr-2" /> Dashboard
                  </Link>
                </li>
              ) : (
                <li>
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
