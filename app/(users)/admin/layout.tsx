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
    <div className="flex-1 flex w-full overflow-hidden h-[calc(100vh-4rem)]">
      <DashboardSidebar
        roleLabel="System Admin"
        userName="Super Admin"
        links={ADMIN_LINKS}
      />
      <main className="flex-1 overflow-auto bg-background p-6">{children}</main>
    </div>
  );
}
