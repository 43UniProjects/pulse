'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { DonorEntity } from '@/types/donor.type';
import DonorProfileView from '@/app/(users)/donor/profile/profile-view';
import DonorProfileForm from '@/app/(users)/donor/profile/profile-form';

export default function DonorProfileClient({
  initialData,
  historyCount,
  completedDonations,
  isAccountActive,
}: {
  initialData: DonorEntity;
  historyCount: number;
  completedDonations: number;
  isAccountActive: boolean;
}) {
  const router = useRouter();
  const isProfileIncomplete =
    !isAccountActive ||
    !initialData.fullName ||
    !initialData.phone ||
    !initialData.bloodGroup ||
    !initialData.dateOfBirth ||
    !initialData.address;

  const [isEditing, setIsEditing] = useState(isProfileIncomplete);

  if (isEditing) {
    return (
      <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
        <DonorProfileForm
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
      <DonorProfileView
        donor={initialData}
        historyCount={historyCount}
        completedDonations={completedDonations}
        onEdit={() => setIsEditing(true)}
      />
    </div>
  );
}
