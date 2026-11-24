'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTheme } from 'next-themes';
import {
  Sun,
  Moon,
  LayoutDashboard,
  ChevronDown,
  User,
  LogOut,
} from 'lucide-react';

import MobileMenu from '@/components/header/mobile-menu';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { NAV_LINKS } from '@/types/common.type';
import { authClient } from '@/lib/auth/client';

interface HeaderProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  session?: any;
}

export default function Header({ session: initialSession }: HeaderProps = {}) {
  const router = useRouter();
  const { resolvedTheme, setTheme } = useTheme();

  // Secure client-side session fetching
  const { data: clientSession } = authClient.useSession();
  const session = clientSession !== undefined ? clientSession : initialSession;

  const dashboardHref = session?.user?.role
    ? `/${session.user.role}/dashboard`
    : '/login';

  const handleLogout = async () => {
    try {
      await authClient.signOut({
        fetchOptions: {
          onSuccess: () => {
            router.push('/login?logged_out=true');
            router.refresh();
          },
          onError: (ctx) => {
            console.error('[Logout Error]', ctx.error);
            router.push('/login?logged_out=true');
            router.refresh();
          },
        },
      });
    } catch (err) {
      console.error('[Logout Exception]', err);
    } finally {
      router.push('/login?logged_out=true');
      router.refresh();
    }
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
            {!session && (
              <ul className="hidden sm:flex items-center gap-6">
                {NAV_LINKS.filter((link) => link.label !== 'Login').map(
                  ({ label, href }) => (
                    <li key={href}>
                      <Link
                        href={href}
                        className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {label}
                      </Link>
                    </li>
                  ),
                )}
                <li className="flex items-center gap-3">
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
              </ul>
            )}

            {/* Authenticated User Dropdown - Rendered on BOTH Mobile and Desktop */}
            {session ? (
              <div className="flex items-center">
                <DropdownMenu>
                  <DropdownMenuTrigger
                    aria-label="User Account Menu"
                    className="inline-flex items-center justify-center h-9 px-3 sm:px-3.5 rounded-md bg-primary text-primary-foreground text-xs sm:text-sm font-medium hover:bg-primary/90 transition-colors shadow-sm cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  >
                    <User className="w-4 h-4 mr-1.5 sm:mr-2 shrink-0" />
                    <span className="max-w-28 sm:max-w-36 truncate">
                      {session.user.name}
                    </span>
                    <ChevronDown className="w-3.5 h-3.5 ml-1 sm:ml-1.5 shrink-0 opacity-80" />
                  </DropdownMenuTrigger>

                  <DropdownMenuContent align="end" className="w-52">
                    <div className="px-2.5 py-2 border-b border-border/50">
                      <p className="text-xs text-muted-foreground">
                        Signed in as
                      </p>
                      <p className="text-sm font-semibold text-foreground truncate">
                        {session.user.name}
                      </p>
                      <p className="text-[11px] font-mono text-muted-foreground capitalize">
                        {session.user.role}
                      </p>
                    </div>

                    <div className="py-1">
                      <DropdownMenuItem
                        onClick={() => {
                          router.push(dashboardHref);
                        }}
                        className="cursor-pointer"
                      >
                        <LayoutDashboard className="w-4 h-4 mr-2 text-muted-foreground" />
                        <span>Dashboard</span>
                      </DropdownMenuItem>

                      <DropdownMenuItem
                        onClick={() => {
                          router.push(`/${session.user.role}/profile`);
                        }}
                        className="cursor-pointer"
                      >
                        <User className="w-4 h-4 mr-2 text-muted-foreground" />
                        <span>My Profile</span>
                      </DropdownMenuItem>
                    </div>

                    <DropdownMenuSeparator />

                    <DropdownMenuItem
                      onClick={handleLogout}
                      className="cursor-pointer text-destructive focus:bg-destructive/10 focus:text-destructive dark:focus:bg-destructive/20"
                    >
                      <LogOut className="w-4 h-4 mr-2 text-destructive" />
                      <span>Logout</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ) : (
              /* Mobile Drawer (Only shown for Guests when not logged in) */
              <div className="sm:hidden">
                <MobileMenu session={session} dashboardHref={dashboardHref} />
              </div>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
}
