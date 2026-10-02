import { Metadata } from 'next';
import SettingsForm from './settings-form';

export const metadata: Metadata = {
  title: 'Account Settings | Pulse',
  description: 'Manage your donor preferences, privacy, and notifications.',
};

export default function DonorSettingsPage() {
  return (
    <div className="max-w-4xl mx-auto w-full space-y-6 animate-in fade-in duration-500">
      {/* Page Header */}
      <div className="border-b border-border pb-6">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          Settings & Preferences
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Manage your notifications, privacy, and clinical availability.
        </p>
      </div>

      <SettingsForm />
    </div>
  );
}
