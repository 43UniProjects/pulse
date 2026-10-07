'use client';

import { useState } from 'react';
import { DonorEntity } from '@/types/donor.type';
import DonorProfileView from './donor-profile-view';
import DonorProfileForm from './donor-profile-form';

export default function DonorProfileClient({
  initialData,
  historyCount,
  completedDonations,
}: {
  initialData: DonorEntity;
  historyCount: number;
  completedDonations: number;
}) {
  const [isEditing, setIsEditing] = useState(false);

  if (isEditing) {
    return (
      <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
        <DonorProfileForm
          initialData={initialData}
          onCancel={() => setIsEditing(false)}
          onSuccess={() => setIsEditing(false)}
        />
      </div>
    );
  }

  return (
    <div className="animate-in fade-in duration-500">
      <DonorProfileView
        donor={initialData}
        historyCount={historyCount}
        completedDonations={completedDonations}
        onEdit={() => setIsEditing(true)}
      />
    </div>
  );
}
