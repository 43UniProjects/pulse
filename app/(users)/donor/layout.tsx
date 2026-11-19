import { Suspense } from 'react';
import Header from '@/components/header/main';
import DashboardSidebar from '@/components/users/dashboard-sidebar';
import VerificationToast from '@/components/auth/verification-toast';
import LocationTracker from '@/components/location/location-tracker';
import { validateRoleAccess } from '@/lib/auth/guard';
import { connectToDatabase } from '@/lib/db/connect';
import { Donor } from '@/lib/models/donor.model';

const DONOR_LINKS = [
  { name: 'Dashboard', href: '/donor/dashboard' },
  { name: 'Active Requests', href: '/donor/requests' },
  { name: 'Profile', href: '/donor/profile' },
];

async function DonorLayoutContent({ children }: { children: React.ReactNode }) {
  const session = await validateRoleAccess('donor', { allowInactive: true });
  await connectToDatabase();

  const donor = await Donor.findById(session.user.id)
    .select('liveLocationSync')
    .lean();
  const liveLocationSync = donor?.liveLocationSync ?? false;

  return (
    <div className="min-h-screen flex flex-col bg-background font-sans">
      <Suspense fallback={null}>
        <VerificationToast />
      </Suspense>
      <Suspense fallback={null}>
        <LocationTracker liveLocationSync={liveLocationSync} />
      </Suspense>
      <Header session={session} />
      <div className="flex-1 flex flex-col md:flex-row w-full">
        <DashboardSidebar
          roleLabel="Registered Donor"
          userName={session.user.name || 'Registered Donor'}
          isDeactivated={!session.user.isActive}
          links={DONOR_LINKS}
        />
        <main className="flex-1 bg-background px-4 pb-4 md:p-8 lg:px-12 w-full">
          {children}
        </main>
      </div>
    </div>
  );
}

export default function DonorLayout({
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
      <DonorLayoutContent>{children}</DonorLayoutContent>
    </Suspense>
  );
}
