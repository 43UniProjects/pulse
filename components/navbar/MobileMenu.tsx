'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Menu } from 'lucide-react';
import { NAV_LINKS } from './navConfig';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';

export default function MobileMenu() {
  const [open, setOpen] = useState(false);

  return (
    <div className="sm:hidden">
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger
          render={
            <button
              type="button"
              aria-label="Toggle navigation menu"
              className="p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors focus:outline-none focus:ring-2 focus:ring-ring"
            />
          }
        >
          <Menu className="w-5 h-5" />
        </SheetTrigger>
        <SheetContent side="right" className="w-[300px] sm:w-[400px]">
          <SheetHeader>
            <SheetTitle className="text-left font-semibold tracking-tight text-2xl text-foreground">
              Pulse
            </SheetTitle>
          </SheetHeader>
          <div className="flex flex-col mt-8 px-4">
            <ul className="flex flex-col gap-6">
              {NAV_LINKS.map(({ label, href }) => (
                <li key={href}>
                  <Link
                    href={href}
                    onClick={() => setOpen(false)}
                    className="block text-lg font-medium text-muted-foreground hover:text-foreground transition-all"
                  >
                    {label}
                  </Link>
                </li>
              ))}
              <li>
                <Link
                  href="/register"
                  onClick={() => setOpen(false)}
                  className="block text-lg font-medium text-muted-foreground hover:text-foreground transition-all"
                >
                  Register
                </Link>
              </li>
            </ul>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
