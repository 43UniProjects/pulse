'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LogOut, LayoutDashboard } from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';

type NavLink = {
  name: string;
  href: string;
  matchPath?: string;
};

// Interface defined here so both components can access it
interface SidebarProps {
  roleLabel: string;
  userName: string;
  links: NavLink[];
}

function SidebarContent({
  roleLabel,
  userName,
  links,
  onNavigate,
}: SidebarProps & { onNavigate?: () => void }) {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-card border-r border-border flex flex-col shrink-0 h-full">
      <div className="px-5 py-4 border-b border-border">
        <span className="text-xs font-sans font-semibold text-muted-foreground uppercase tracking-wider">
          {roleLabel}
        </span>
      </div>

      <nav className="flex-1 p-3 flex flex-col gap-1 overflow-y-auto">
        {links.map((link) => {
          const isActive = link.matchPath
            ? pathname.startsWith(link.matchPath)
            : pathname === link.href;

          return (
            <Link
              key={link.name}
              href={link.href}
              onClick={onNavigate}
              className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-all ${
                isActive
                  ? 'bg-primary/10 text-primary border border-primary/20 shadow-sm'
                  : 'text-muted-foreground hover:text-foreground hover:bg-secondary border border-transparent'
              }`}
            >
              {link.name}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-border bg-background">
        <div className="text-xs font-mono text-muted-foreground mb-1 uppercase tracking-widest">
          Logged in as
        </div>
        <div className="text-sm font-semibold text-foreground truncate mb-3">
          {userName}
        </div>
        <Link
          href="/login"
          onClick={onNavigate}
          className="flex items-center gap-2 text-xs font-medium text-muted-foreground hover:text-primary transition-colors"
        >
          <LogOut className="w-4 h-4" />
          Logout
        </Link>
      </div>
    </aside>
  );
}

export default function DashboardSidebar(props: SidebarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsOpen(false);
  }, [pathname]);

  return (
    <>
      {/* Mobile Secondary Menu */}
      <div className="px-6 pt-6 pb-2 md:hidden w-full border-b border-border mb-4">
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger
            aria-label="Toggle dashboard menu"
            className="p-2 -ml-3 rounded-md text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-ring inline-flex items-center gap-2"
          >
            <LayoutDashboard className="w-5 h-5 text-primary" />
            <span className="text-sm font-semibold tracking-wide uppercase">
              Dashboard Menu
            </span>
          </SheetTrigger>
          <SheetContent
            side="left"
            className="p-0 w-64! gap-0 border-r-0 top-23.5! bottom-0! h-[calc(100dvh-94px)]!"
            overlayClassName="!top-23.5"
          >
            <SidebarContent {...props} onNavigate={() => setIsOpen(false)} />
          </SheetContent>
        </Sheet>
      </div>

      {/* Desktop Fixed Sidebar */}
      <div className="hidden md:block shrink-0 w-64">
        <div className="fixed left-0 top-23.5 bottom-0 w-64 border-r border-border bg-background overflow-y-auto overflow-x-hidden">
          <SidebarContent {...props} />
        </div>
      </div>
    </>
  );
}
