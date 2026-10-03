import Header from '@/components/Header';
import DashboardSidebar from '@/components/users/dashboard-sidebar';
import { Menu } from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';

const HOSPITAL_LINKS = [
  { name: 'Dashboard', href: '/hospital/dashboard' },
  { name: 'Post Request', href: '/hospital/post-request' },
  { name: 'Request Tracking', href: '/hospital/tracking' },
  { name: 'Registered Donors', href: '/hospital/donors' },
];

export default function HospitalLayout({
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
                  className="p-2 -ml-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-ring inline-flex items-center gap-2"
                />
              }
            >
              <Menu className="w-5 h-5" />
              <span className="text-sm font-medium">Menu</span>
            </SheetTrigger>
            <SheetContent
              side="left"
              className="p-0 !w-64 gap-0 border-r-0 !top-[94px] !bottom-0 !h-[calc(100dvh-94px)]"
              overlayClassName="!top-[94px]"
            >
              <DashboardSidebar
                roleLabel="Clinical Facility"
                userName="Nawaloka Hospital"
                links={HOSPITAL_LINKS}
              />
            </SheetContent>
          </Sheet>
        </div>

        {/* Desktop Fixed Sidebar */}
        <div className="hidden md:block shrink-0 w-64">
          <div className="fixed left-0 top-[94px] bottom-0 w-64 border-r border-border bg-background overflow-y-auto overflow-x-hidden">
            <DashboardSidebar
              roleLabel="Clinical Facility"
              userName="Nawaloka Hospital"
              links={HOSPITAL_LINKS}
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
