'use client';

import { useState } from 'react';
import { AdminEntity } from '@/types/admin.type';
import AdminProfileView from './admin-profile-view';
import AdminProfileForm from './admin-profile-form';

export default function AdminProfileClient({
  initialData,
}: {
  initialData: AdminEntity;
}) {
  const [isEditing, setIsEditing] = useState(false);

  if (isEditing) {
    return (
      <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
        <AdminProfileForm
          initialData={initialData}
          onCancel={() => setIsEditing(false)}
          onSuccess={() => setIsEditing(false)}
        />
      </div>
    );
  }

  return (
    <div className="animate-in fade-in duration-500">
      <AdminProfileView admin={initialData} onEdit={() => setIsEditing(true)} />
    </div>
  );
}
