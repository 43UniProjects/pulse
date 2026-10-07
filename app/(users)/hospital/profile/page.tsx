import { Metadata } from 'next';
import HospitalProfileClient from './hospital-profile-client';
import { getHospitalProfile } from './data';

export const metadata: Metadata = {
  title: 'Facility Profile | Pulse',
  description: 'Manage your hospital profile and coordinator details.',
};

export default async function HospitalProfilePage() {
  const hospitalId = 'hospital_1';
  const hospital = await getHospitalProfile(hospitalId);

  if (!hospital) {
    return (
      <div className="flex items-center justify-center h-[60vh] text-muted-foreground">
        Profile data not found.
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto w-full space-y-6">
      <HospitalProfileClient initialData={hospital} />
    </div>
  );
}
