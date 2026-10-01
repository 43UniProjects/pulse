import DashboardSidebar from '@/components/users/DashboardSidebar';

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
    <div className="flex-1 flex w-full overflow-hidden h-[calc(100vh-4rem)]">
      <DashboardSidebar
        roleLabel="Clinical Facility"
        userName="Nawaloka Hospital"
        links={HOSPITAL_LINKS}
      />
      <main className="flex-1 overflow-auto bg-background p-6">{children}</main>
    </div>
  );
}
