'use client';

import { useState } from 'react';
import { HospitalEntity } from '@/types/hospital.type';
import HospitalProfileView from './hospital-profile-view';
import HospitalProfileForm from './hospital-profile-form';

export default function HospitalProfileClient({
  initialData,
}: {
  initialData: HospitalEntity;
}) {
  const isProfileIncomplete =
    !initialData.name ||
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
          onSuccess={() => setIsEditing(false)}
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
