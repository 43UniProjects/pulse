import Header from '@/components/Header';
import Footer from '@/components/Footer';
import DashboardSidebar from '@/components/users/dashboard-sidebar';
import { Menu } from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';

const ADMIN_LINKS = [
  { name: 'Dashboard', href: '/admin/dashboard' },
  { name: 'Verify Hospitals', href: '/admin/verify-hospitals' },
  { name: 'Manage Users', href: '/admin/manage-users' },
];

export default function AnyDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col bg-background font-sans">
      <Header />

      <div className="flex-1 flex flex-col md:flex-row w-full">
        {/* Mobile Hamburger Menu */}
        <div className="px-6 pt-6 pb-2 md:hidden">
          <Sheet>
            <SheetTrigger
              render={
                <button
                  type="button"
                  aria-label="Toggle dashboard menu"
                  className="p-2 -ml-3 rounded-md text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-ring inline-flex items-center gap-2"
                />
              }
            >
              <Menu className="w-10 h-5" style={{ transform: 'scaleX(1.7)' }} />
              <span className="text-base font-medium">Menu</span>
            </SheetTrigger>
            <SheetContent
              side="left"
              className="p-0 !w-64 gap-0 border-r-0 !top-[94px] !bottom-0 !h-[calc(100dvh-94px)]"
              overlayClassName="!top-[94px]"
            >
              <DashboardSidebar
                roleLabel="System Administrator"
                userName="Admin User"
                links={ADMIN_LINKS}
              />
            </SheetContent>
          </Sheet>
        </div>

        {/* Desktop Fixed Sidebar */}
        <div className="hidden md:block shrink-0 w-64">
          <div className="fixed left-0 top-[94px] bottom-0 w-64 border-r border-border bg-background overflow-y-auto overflow-x-hidden">
            <DashboardSidebar
              roleLabel="System Administrator"
              userName="Admin User"
              links={ADMIN_LINKS}
            />
          </div>
        </div>

        <main className="flex-1 bg-background px-4 pb-4 md:p-8 lg:px-12 w-full">
          {children}
        </main>
      </div>
    </div>
  );
}
