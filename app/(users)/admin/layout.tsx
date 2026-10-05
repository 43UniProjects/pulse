import Header from '@/components/Header';
import DashboardSidebar from '@/components/users/dashboard-sidebar';

const ADMIN_LINKS = [
  { name: 'Dashboard', href: '/admin/dashboard' },
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
      <div className="flex-1 flex flex-col md:flex-row w-full">
        <DashboardSidebar
          roleLabel="System Administrator"
          userName="Admin User"
          links={ADMIN_LINKS}
        />
        <main className="flex-1 bg-background px-4 pb-4 md:p-8 lg:px-12 w-full">
          {children}
        </main>
      </div>
    </div>
  );
}
