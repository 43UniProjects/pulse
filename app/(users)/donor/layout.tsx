import DashboardSidebar from '@/components/users/DashboardSidebar';

const DONOR_LINKS = [
  { name: 'Dashboard', href: '/donor/dashboard' },
  { name: 'Donation History', href: '/donor/history' },
  { name: 'Eligibility Status', href: '/donor/eligibility' },
  { name: 'Account Settings', href: '/donor/settings' },
];

export default function DonorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex-1 flex w-full overflow-hidden h-[calc(100vh-4rem)]">
      <DashboardSidebar
        roleLabel="Verified Donor"
        userName="Kamal Perera"
        links={DONOR_LINKS}
      />
      <main className="flex-1 overflow-auto bg-background p-6">{children}</main>
    </div>
  );
}
