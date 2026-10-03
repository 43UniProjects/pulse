import Footer from '@/components/Footer';
import Header from '@/components/Header';
import DashboardSidebar from '@/components/users/dashboard-sidebar';
import { Menu } from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';

const HOSPITAL_LINKS = [
  { name: 'Dashboard', href: '/hospital/dashboard' },
  { name: 'Post Request', href: '/hospital/post-request' },
  {
    name: 'Request Tracking',
    href: '/hospital/tracking/1',
    matchPath: '/hospital/tracking',
  },
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

      <div className="flex-1 flex flex-col w-full max-w-7xl mx-auto">
        <div className="px-6 pt-6 pb-2">
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
        <main className="flex-1 bg-background px-4 pb-4 md:px-8 md:pb-8 lg:px-12 w-full">
          {children}
        </main>
      </div>

      <Footer />
    </div>
  );
}
