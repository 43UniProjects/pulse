import Footer from '@/components/Footer';
import Header from '@/components/Header';
import DashboardSidebar from '@/components/users/dashboard-sidebar';

const DONOR_LINKS = [
  { name: 'Dashboard', href: '/donor/dashboard' },
  { name: 'Donations', href: '/donor/requests' },
  { name: 'Profile', href: '/donor/profile' },
  { name: 'Settings', href: '/donor/profile/settings' },
];

export default function DonorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col bg-background font-sans">
      <Header />

      <div className="flex-1 flex flex-col md:flex-row w-full max-w-350 mx-auto">
        <div className="shrink-0 md:w-64 md:sticky md:top-16 md:h-[calc(100vh-4rem)] z-10 bg-background">
          <DashboardSidebar
            roleLabel="Registered Donor"
            userName="Kamal Perera"
            links={DONOR_LINKS}
          />
        </div>

        <main className="flex-1 bg-background p-4 md:p-8 lg:px-12 w-full">
          {children}
        </main>
      </div>

      <Footer />
    </div>
  );
}
