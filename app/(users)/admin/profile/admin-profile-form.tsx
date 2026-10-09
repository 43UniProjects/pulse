'use client';

import { useActionState, useEffect } from 'react';
import { User, Phone, Mail, Save, Loader2, Briefcase } from 'lucide-react';
import { toast } from 'sonner';
import { updateAdminProfile } from '@/actions/admin.actions';
import { AdminEntity } from '@/types/admin.type';

export default function AdminProfileForm({
  initialData,
  onCancel,
  onSuccess,
}: {
  initialData: AdminEntity;
  onCancel: () => void;
  onSuccess: () => void;
}) {
  const [state, formAction, isPending] = useActionState(updateAdminProfile, {
    success: false,
  });

  useEffect(() => {
    if (state.success) {
      toast.success('Profile updated successfully!');
      onSuccess();
    } else if (state.error && !state.fieldErrors) {
      toast.error(state.error);
    }
  }, [state, onSuccess]);

  return (
    <div className="space-y-6">
      {/* Form Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-border pb-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            Edit Admin Profile
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Update your administrative account details below.
          </p>
        </div>
      </div>

      <form action={formAction} className="space-y-8">
        <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
          {/* Section: Basic Details */}
          <div className="p-6">
            <h2 className="text-lg font-semibold text-foreground mb-4">
              Basic Details
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-medium text-foreground block">
                  Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type="text"
                    name="fullName"
                    defaultValue={initialData.fullName}
                    className="w-full pl-10 pr-4 py-2 bg-background border border-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                    placeholder="Enter your full name"
                  />
                </div>
                {state.fieldErrors?.fullName && (
                  <p className="text-xs text-destructive mt-1">
                    {state.fieldErrors.fullName[0]}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-xs font-medium text-foreground block">
                  Department
                </label>
                <div className="relative">
                  <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type="text"
                    name="department"
                    defaultValue={initialData.department}
                    className="w-full pl-10 pr-4 py-2 bg-background border border-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                    placeholder="E.g. Technical Support, Medical Verification"
                  />
                </div>
                {state.fieldErrors?.department && (
                  <p className="text-xs text-destructive mt-1">
                    {state.fieldErrors.department[0]}
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="h-px bg-border w-full" />

          {/* Section: Contact Details */}
          <div className="p-6">
            <h2 className="text-lg font-semibold text-foreground mb-4">
              Contact Details
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-medium text-foreground block">
                  Contact Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type="email"
                    name="email"
                    defaultValue={initialData.email}
                    className="w-full pl-10 pr-4 py-2 bg-background border border-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                    placeholder="Enter your contact email"
                  />
                </div>
                {state.fieldErrors?.email && (
                  <p className="text-xs text-destructive mt-1">
                    {state.fieldErrors.email[0]}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-xs font-medium text-foreground block">
                  Phone Number
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type="tel"
                    name="phone"
                    defaultValue={initialData.phone}
                    className="w-full pl-10 pr-4 py-2 bg-background border border-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                    placeholder="Enter phone number"
                  />
                </div>
                {state.fieldErrors?.phone && (
                  <p className="text-xs text-destructive mt-1">
                    {state.fieldErrors.phone[0]}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex items-center justify-end gap-4 pt-4">
          <button
            type="button"
            onClick={onCancel}
            disabled={isPending}
            className="px-4 py-2 text-sm font-medium text-muted-foreground bg-transparent border border-transparent rounded-md hover:bg-secondary/50 disabled:opacity-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isPending}
            className="inline-flex items-center justify-center gap-2 px-6 py-2 text-sm font-medium text-primary-foreground bg-primary rounded-md hover:bg-primary/90 disabled:opacity-50 transition-colors"
          >
            {isPending ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Saving Changes...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Save Profile
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
