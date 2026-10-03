import Footer from '@/components/Footer';
import Header from '@/components/Header';
import DashboardSidebar from '@/components/users/dashboard-sidebar';

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

      <div className="flex-1 flex flex-col md:flex-row w-full max-w-350 mx-auto">
        {}
        <div className="shrink-0 md:w-64 relative">
          {}
          <div className="md:fixed md:w-64 md:top-[105px] md:bottom-0 z-10 bg-background overflow-y-auto">
            <DashboardSidebar
              roleLabel="Clinical Facility"
              userName="Nawaloka Hospital"
              links={HOSPITAL_LINKS}
            />
          </div>
        </div>

        <main className="flex-1 bg-background p-4 md:p-8 lg:px-12 w-full">
          {children}
        </main>
      </div>

      <Footer />
    </div>
  );
}
