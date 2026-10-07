import Header from '@/components/header/main';
import DashboardSidebar from '@/components/users/dashboard-sidebar';

const HOSPITAL_LINKS = [
  { name: 'Dashboard', href: '/hospital/dashboard' },
  { name: 'Post Request', href: '/hospital/post-request' },
  { name: 'Registered Donors', href: '/hospital/donors' },
  { name: 'Profile', href: '/hospital/profile' },
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
        <DashboardSidebar
          roleLabel="Clinical Facility"
          userName="Nawaloka Hospital"
          links={HOSPITAL_LINKS}
        />
        <main className="flex-1 bg-background px-4 pb-4 md:p-8 lg:px-12 w-full">
          {children}
        </main>
      </div>
    </div>
  );
}
