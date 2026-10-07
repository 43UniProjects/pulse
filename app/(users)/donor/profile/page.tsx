import { Metadata } from 'next';
import { DonorEntity } from '@/types/donor.type';
import DonorProfileClient from './donor-profile-client';

export const metadata: Metadata = {
  title: 'My Profile | Pulse',
  description: 'Manage your donor profile and availability.',
};

export default async function DonorProfilePage() {
  // Statically defined typed mock object
  const mockDonor: DonorEntity = {
    _id: '64d1f2a3e4b5c6d7e8f9a0b1',
    fullName: 'Kamal Perera',
    email: 'kamal.contact@example.com',
    phone: '+94 77 123 4567',
    bloodGroup: 'O+',
    dateOfBirth: new Date('1995-05-14'),
    address: '123 Main St, Colombo 03',
    location: {
      type: 'Point',
      coordinates: [79.8612, 6.9271], // [longitude, latitude]
    },
    radiusPreferenceKm: 15,
    lastDonationDate: new Date('2023-11-20'),
    isEligible: true,
    isAvailable: true,
    liveLocationSync: false,
    smsAlertsEnabled: true,
    emailAlertsEnabled: false,
    history: [],
    createdAt: new Date('2023-01-01'),
    updatedAt: new Date('2024-01-01'),
  };

  return (
    <div className="max-w-5xl mx-auto w-full space-y-6">
      <DonorProfileClient
        initialData={mockDonor}
        historyCount={12}
        completedDonations={10}
      />
    </div>
  );
}
