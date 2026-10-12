'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Menu, LayoutDashboard } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';

import { NAV_LINKS } from '@/types/common.type';

interface MobileMenuProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  session: any | null;
  dashboardHref: string;
}

export default function MobileMenu({
  session,
  dashboardHref,
}: MobileMenuProps) {
  const [open, setOpen] = useState(false);

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
        className="w-75 sm:w-100 p-0 border-l border-border"
      >
        <SheetHeader className="p-6 border-b border-border/50 text-left">
          <SheetTitle className="font-bold tracking-tight text-2xl text-foreground flex items-center">
            Pulse
          </SheetTitle>
        </SheetHeader>

        <nav className="flex flex-col p-4">
          <ul className="flex flex-col gap-2">
            {/* 2. Filter standard links based on the actual Better Auth session */}
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

            {/* 3. Render dynamic Role-Based CTA Buttons */}
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
