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

      {/* Constrained layout container to prevent wide-screen separation */}
      <div className="flex-1 flex flex-col md:flex-row w-full max-w-350 mx-auto">
        {/* Sticky sidebar wrapper: locks height to viewport and pins bottom session card */}
        <div className="shrink-0 md:w-64 md:sticky md:top-16 md:h-[calc(100vh-4rem)] z-10 bg-background">
          <DashboardSidebar
            roleLabel="Clinical Facility"
            userName="Nawaloka Hospital"
            links={HOSPITAL_LINKS}
          />
        </div>

        {/* Main content pane with natural scrolling */}
        <main className="flex-1 bg-background p-4 md:p-8 lg:px-12 w-full">
          {children}
        </main>
      </div>

      <Footer />
    </div>
  );
}
