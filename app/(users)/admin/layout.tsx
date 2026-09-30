import Footer from '@/components/Footer';
import Header from '@/components/Header';
import DashboardSidebar from '@/components/users/DashboardSidebar';

const ADMIN_LINKS = [
  { name: 'System Dashboard', href: '/admin/dashboard' },
  { name: 'Verify Hospitals', href: '/admin/verify-hospitals' },
  { name: 'Manage Users', href: '/admin/manage-users' },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col bg-background font-sans">
      <Header />
      <div className="flex-1 flex overflow-hidden h-[calc(100vh-4rem)]">
        <DashboardSidebar
          roleLabel="System Admin"
          userName="Super Admin"
          links={ADMIN_LINKS}
        />
        <main className="flex-1 overflow-auto bg-background p-6">
          {children}
        </main>
      </div>
      <Footer />
    </div>
  );
}
