'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function DonorSidebar() {
  const pathname = usePathname();

  const isActive = (path: string) => pathname.startsWith(path);

  return (
    <aside className="w-56 bg-sidebar border-r border-sidebar-border flex flex-col shrink-0">
      <nav className="flex-1 p-3 flex flex-col gap-1 text-sm font-medium">
        <Link
          href="/donor/dashboard"
          className={`flex items-center gap-2.5 px-3 py-2 rounded-md transition-colors ${
            pathname === '/donor/dashboard'
              ? 'bg-sidebar-primary/10 text-sidebar-primary'
              : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
          }`}
        >
          Dashboard
        </Link>
        <Link
          href="/donor/profile"
          className={`flex items-center gap-2.5 px-3 py-2 rounded-md transition-colors ${
            pathname === '/donor/profile'
              ? 'bg-sidebar-primary/10 text-sidebar-primary'
              : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
          }`}
        >
          My Profile
        </Link>
        <Link
          href="/donor/requests"
          className={`flex items-center gap-2.5 px-3 py-2 rounded-md transition-colors ${
            isActive('/donor/requests')
              ? 'bg-sidebar-primary/10 text-sidebar-primary'
              : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
          }`}
        >
          Emergency Requests
        </Link>
      </nav>

      <div className="p-4 border-t border-sidebar-border">
        <div className="text-xs text-muted-foreground mb-1">Signed in as</div>
        <div className="text-sm font-medium text-sidebar-foreground">
          Banuka
        </div>
        <Link
          href="/login"
          className="text-xs text-primary hover:underline mt-1 block w-fit focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1 focus:ring-offset-sidebar"
        >
          Sign out
        </Link>
      </div>
    </aside>
  );
}
