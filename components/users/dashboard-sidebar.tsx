'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LogOut } from 'lucide-react';

type NavLink = {
  name: string;
  href: string;
  matchPath?: string; // Used for dynamic routes (e.g., /tracking/1)
};

interface SidebarProps {
  roleLabel: string;
  userName: string;
  links: NavLink[];
}

export default function DashboardSidebar({
  roleLabel,
  userName,
  links,
}: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-card border-r border-border flex flex-col shrink-0 h-full">
      {/* Role Indicator */}
      <div className="px-5 py-4 border-b border-border">
        <span className="text-xs font-sans font-semibold text-muted-foreground uppercase tracking-wider">
          {roleLabel}
        </span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 flex flex-col gap-1 overflow-y-auto">
        {links.map((link) => {
          const isActive = link.matchPath
            ? pathname.startsWith(link.matchPath)
            : pathname === link.href;

          return (
            <Link
              key={link.name}
              href={link.href}
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

      {/* User Footer */}
      <div className="p-4 border-t border-border bg-background">
        <div className="text-xs font-mono text-muted-foreground mb-1 uppercase tracking-widest">
          Active Session
        </div>
        <div className="text-sm font-semibold text-foreground truncate mb-3">
          {userName}
        </div>
        <Link
          href="/login"
          className="flex items-center gap-2 text-xs font-medium text-muted-foreground hover:text-primary transition-colors"
        >
          <LogOut className="w-4 h-4" />
          Terminate Session
        </Link>
      </div>
    </aside>
  );
}
