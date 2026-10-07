import { Metadata } from 'next';
import { HospitalEntity } from '@/types/hospital.type';
import HospitalProfileClient from './hospital-profile-client';

export const metadata: Metadata = {
  title: 'Facility Profile | Pulse',
  description: 'Manage your hospital profile and coordinator details.',
};

export default async function HospitalProfilePage() {
  // Statically defined typed mock object for Hospital
  const mockHospital: HospitalEntity = {
    _id: '64d1f2a3e4b5c6d7e8f9b0c2', // matches base User._id conceptually
    name: 'National Hospital of Sri Lanka',
    facilityType: 'government_hospital',
    verificationStatus: 'verified',
    verifiedAt: new Date('2023-01-15'),
    address: 'Regent Street, Colombo 08',
    city: 'Colombo',
    location: {
      type: 'Point',
      coordinates: [79.8661, 6.9197], // [longitude, latitude]
    },
    hotline: '+94 11 269 1111',
    email: 'bloodbank@nhsl.health.lk',
    website: 'https://nhsl.health.lk',
    coordinator: {
      name: 'Dr. Saman Weerasinghe',
      designation: 'Head of Blood Bank',
      contactNumber: '+94 71 234 5678',
      email: 'saman.w@nhsl.health.lk',
    },
    activeRequestsCount: 3,
    createdAt: new Date('2023-01-10'),
    updatedAt: new Date('2024-01-01'),
  };

  return (
    <div className="max-w-5xl mx-auto w-full space-y-6">
      <HospitalProfileClient initialData={mockHospital} />
    </div>
  );
}
