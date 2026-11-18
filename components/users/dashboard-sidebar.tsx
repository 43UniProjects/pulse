'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { LogOut, LayoutDashboard, Lock } from 'lucide-react';
import { toast } from 'sonner';

import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { authClient } from '@/lib/auth/client';

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
  isDeactivated?: boolean;
}

function SidebarContent({
  roleLabel,
  userName,
  links,
  isDeactivated,
  onNavigate,
}: SidebarProps & { onNavigate?: () => void }) {
  const pathname = usePathname();
  const router = useRouter();

  // Better Auth client-side logout handler
  const handleLogout = async () => {
    if (onNavigate) onNavigate(); // Close the mobile menu immediately

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
      // Guaranteed fallback so the user is never stranded
      router.push('/login?logged_out=true');
      router.refresh();
    }
  };

  return (
    <aside className="w-64 bg-card border-r border-border flex flex-col shrink-0 h-full">
      <div className="px-5 py-4 border-b border-border flex items-center justify-between">
        <span className="text-xs font-sans font-semibold text-muted-foreground uppercase tracking-wider">
          {roleLabel}
        </span>
        {isDeactivated && (
          <span className="text-[10px] bg-amber-500/10 text-amber-500 border border-amber-500/20 px-2 py-0.5 rounded-full font-mono font-medium">
            Inactive
          </span>
        )}
      </div>

      <nav className="flex-1 p-3 flex flex-col gap-1 overflow-y-auto">
        {links.map((link) => {
          const isActive = link.matchPath
            ? pathname.startsWith(link.matchPath)
            : pathname === link.href;

          const isLocked = isDeactivated && !link.href.includes('/profile');

          return (
            <Link
              key={link.name}
              href={isLocked ? '#' : link.href}
              onClick={(e) => {
                if (isLocked) {
                  e.preventDefault();
                  toast.error(
                    'Account deactivated. Please complete and save your profile details to activate your account.',
                  );
                  return;
                }
                if (onNavigate) onNavigate();
              }}
              className={`flex items-center justify-between px-3 py-2 rounded-md text-sm font-medium transition-all ${
                isLocked
                  ? 'text-muted-foreground/50 opacity-60 cursor-not-allowed hover:bg-transparent'
                  : isActive
                    ? 'bg-primary/10 text-primary border border-primary/20 shadow-sm'
                    : 'text-muted-foreground hover:text-foreground hover:bg-secondary border border-transparent'
              }`}
            >
              <span>{link.name}</span>
              {isLocked && (
                <Lock className="w-3.5 h-3.5 text-muted-foreground/60" />
              )}
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

        {/* Replaced Server Action form with a standard button calling the SDK */}
        <button
          type="button"
          onClick={handleLogout}
          className="flex w-full items-center gap-2 text-xs font-medium text-muted-foreground hover:text-primary transition-colors cursor-pointer bg-transparent border-0 p-0 m-0"
        >
          <LogOut className="w-4 h-4" />
          Logout
        </button>
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
