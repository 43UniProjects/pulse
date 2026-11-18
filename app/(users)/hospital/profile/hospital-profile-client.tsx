'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { HospitalEntity } from '@/types/hospital.type';
import HospitalProfileView from './hospital-profile-view';
import HospitalProfileForm from './hospital-profile-form';

export default function HospitalProfileClient({
  initialData,
  isAccountActive,
}: {
  initialData: HospitalEntity;
  isAccountActive: boolean;
}) {
  const router = useRouter();
  const isProfileIncomplete =
    !isAccountActive ||
    !initialData.name ||
    !initialData.facilityType ||
    !initialData.address ||
    !initialData.city ||
    !initialData.hotline ||
    !initialData.coordinator?.name ||
    !initialData.coordinator?.designation ||
    !initialData.coordinator?.contactNumber ||
    !initialData.coordinator?.email;

  const [isEditing, setIsEditing] = useState(isProfileIncomplete);

  if (isEditing) {
    return (
      <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
        <HospitalProfileForm
          initialData={initialData}
          isIncomplete={isProfileIncomplete}
          onCancel={() => {
            if (!isProfileIncomplete) {
              setIsEditing(false);
            }
          }}
          onSuccess={() => {
            setIsEditing(false);
            router.refresh();
          }}
        />
      </div>
    );
  }

  return (
    <div className="animate-in fade-in duration-500">
      <HospitalProfileView
        hospital={initialData}
        onEdit={() => setIsEditing(true)}
      />
    </div>
  );
}
