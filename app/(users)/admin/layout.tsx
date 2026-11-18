import { Suspense } from 'react';
import Header from '@/components/header/main';
import DashboardSidebar from '@/components/users/dashboard-sidebar';
import VerificationToast from '@/components/auth/verification-toast';
import { validateRoleAccess } from '@/lib/auth/guard';

const ADMIN_LINKS = [
  { name: 'Dashboard', href: '/admin/dashboard' },
  { name: 'Verify Hospitals', href: '/admin/verify-hospitals' },
  { name: 'Manage Users', href: '/admin/manage-users' },
  { name: 'FAQ Management', href: '/admin/faqs' },
  { name: 'Profile', href: '/admin/profile' },
];

async function AdminLayoutContent({ children }: { children: React.ReactNode }) {
  const session = await validateRoleAccess('admin');

  return (
    <div className="min-h-screen flex flex-col bg-background font-sans">
      <Suspense fallback={null}>
        <VerificationToast />
      </Suspense>
      <Header session={session} />
      <div className="flex-1 flex flex-col md:flex-row w-full">
        <DashboardSidebar
          roleLabel="System Administrator"
          userName={session.user.name || 'System Administrator'}
          links={ADMIN_LINKS}
        />
        <main className="flex-1 bg-background px-4 pb-4 md:p-8 lg:px-12 w-full">
          {children}
        </main>
      </div>
    </div>
  );
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-background">
          <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
        </div>
      }
    >
      <AdminLayoutContent>{children}</AdminLayoutContent>
    </Suspense>
  );
}
