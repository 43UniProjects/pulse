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
  const [isEditing, setIsEditing] = useState(false);

  if (isEditing) {
    return (
      <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
        <HospitalProfileForm
          initialData={initialData}
          onCancel={() => setIsEditing(false)}
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
