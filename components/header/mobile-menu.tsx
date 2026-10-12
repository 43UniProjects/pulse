'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Menu, LayoutDashboard, ChevronDown, User, LogOut } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';

import { NAV_LINKS } from '@/types/common.type';
import { authClient } from '@/lib/auth/client';

interface MobileMenuProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  session: any | null;
  dashboardHref: string;
}

export default function MobileMenu({
  session,
  dashboardHref,
}: MobileMenuProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const handleLogout = async () => {
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          setOpen(false); // Close the mobile menu
          router.push('/login');
        },
      },
    });
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger
        aria-label="Toggle navigation menu"
        className="p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors focus:outline-none focus:ring-2 focus:ring-ring"
      >
        <Menu className="w-6 h-6" />
      </SheetTrigger>

      <SheetContent
        side="right"
        className="w-75 sm:w-100 p-0 border-l border-border flex flex-col"
      >
        <SheetHeader className="p-6 border-b border-border/50 text-left bg-secondary/20">
          <SheetTitle className="font-bold tracking-tight text-2xl text-foreground flex items-center">
            Pulse
          </SheetTitle>

          {session && (
            <div className="mt-3">
              <button
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="flex items-center gap-2 text-sm font-medium text-foreground hover:text-primary transition-colors focus:outline-none w-full"
              >
                <span>Logged in as {session.user.name}</span>
                <ChevronDown
                  className={`w-4 h-4 transition-transform ${isProfileOpen ? 'rotate-180' : ''}`}
                />
              </button>

              {/* Inline Mobile Profile Menu */}
              {isProfileOpen && (
                <div className="mt-3 flex flex-col gap-1 border-l-2 border-primary/30 pl-3 animate-in slide-in-from-top-2 fade-in duration-200">
                  <Link
                    href={`/${session.user.role}/profile`}
                    onClick={() => setOpen(false)}
                    className="flex items-center py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <User className="w-4 h-4 mr-2" />
                    Visit Profile
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="flex items-center py-2 text-sm text-red-500 hover:text-red-600 transition-colors text-left"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Logout
                  </button>
                </div>
              )}
            </div>
          )}
        </SheetHeader>

        <nav className="flex flex-col p-4 flex-1 overflow-y-auto">
          <ul className="flex flex-col gap-2">
            {NAV_LINKS.filter((link) =>
              session ? link.label === 'Home' : true,
            ).map(({ label, href }) => (
              <li key={href}>
                <Link
                  href={href}
                  onClick={() => setOpen(false)}
                  className="block px-4 py-3 rounded-lg text-lg font-medium text-muted-foreground hover:text-foreground hover:bg-secondary/60 transition-all active:scale-[0.98]"
                >
                  {label}
                </Link>
              </li>
            ))}

            {session ? (
              <li>
                <Link
                  href={dashboardHref}
                  onClick={() => setOpen(false)}
                  className="flex items-center justify-center gap-2 px-4 py-3 mt-4 rounded-lg text-lg font-semibold bg-primary text-primary-foreground hover:bg-primary/90 transition-all"
                >
                  <LayoutDashboard className="w-5 h-5" />
                  Dashboard
                </Link>
              </li>
            ) : (
              <li>
                <Link
                  href="/register"
                  onClick={() => setOpen(false)}
                  className="flex items-center justify-center gap-2 px-4 py-3 mt-4 rounded-lg text-lg font-semibold bg-primary text-primary-foreground hover:bg-primary/90 transition-all"
                >
                  Register
                </Link>
              </li>
            )}
          </ul>
        </nav>
      </SheetContent>
    </Sheet>
  );
}
