import {
  User,
  MapPin,
  Phone,
  Mail,
  Edit3,
  ShieldAlert,
  Clock,
  Activity,
  Briefcase,
  CalendarDays,
  CheckCircle2,
  XCircle,
  AlertCircle,
} from 'lucide-react';
import { AdminEntity } from '@/types/admin.type';

export default function AdminProfileView({
  admin,
  onEdit,
}: {
  admin: AdminEntity;
  onEdit: () => void;
}) {
  const formatRole = (role: string) => {
    return role
      .split('_')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'text-green-600 bg-green-500/10 border-green-500/20';
      case 'suspended':
        return 'text-yellow-600 bg-yellow-500/10 border-yellow-500/20';
      case 'deactivated':
        return 'text-red-600 bg-red-500/10 border-red-500/20';
      default:
        return 'text-muted-foreground bg-secondary border-border';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle2 className="w-4 h-4" />;
      case 'suspended':
        return <AlertCircle className="w-4 h-4" />;
      case 'deactivated':
        return <XCircle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-border pb-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            Admin Profile
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage your administrative account details and department settings.
          </p>
        </div>
        <button
          onClick={onEdit}
          className="inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium bg-secondary text-secondary-foreground border border-border rounded-md hover:bg-secondary/80 transition-colors"
        >
          <Edit3 className="w-4 h-4" />
          Edit Profile
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Identity Card */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-card border border-border rounded-xl p-6 shadow-sm flex flex-col sm:flex-row items-center sm:items-start gap-6 relative overflow-hidden">
            {/* Accent line based on role */}
            <div
              className={`absolute top-0 left-0 w-1.5 h-full ${admin.role === 'superadmin' ? 'bg-primary' : 'bg-blue-500'}`}
            />

            {/* Admin Avatar */}
            <div className="shrink-0 w-24 h-24 rounded-2xl bg-secondary/50 border border-border flex flex-col items-center justify-center text-muted-foreground ml-2">
              <User className="w-10 h-10 opacity-80" />
            </div>

            {/* Core Info */}
            <div className="flex-1 text-center sm:text-left space-y-3 mt-2">
              <div>
                <h2 className="text-2xl font-semibold text-foreground">
                  {admin.fullName}
                </h2>
                <div className="flex items-center justify-center sm:justify-start gap-2 mt-1">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-primary/10 text-primary text-xs font-semibold uppercase tracking-wider">
                    <ShieldAlert className="w-3.5 h-3.5" />
                    {formatRole(admin.role)}
                  </span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-sm text-muted-foreground mt-2">
                <span className="flex items-center justify-center sm:justify-start gap-1.5">
                  <User className="w-4 h-4" /> ID: ADM-
                  {typeof admin._id === 'string'
                    ? admin._id.substring(admin._id.length - 4)
                    : '0000'}
                </span>
                <span className="hidden sm:inline">•</span>
                <span className="flex items-center justify-center sm:justify-start gap-1.5">
                  <Briefcase className="w-4 h-4" />{' '}
                  {admin.department || 'Not Assigned'}
                </span>
              </div>
            </div>
          </div>

          {/* Contact Details */}
          <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
            <h3 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground mb-4">
              Contact Information
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-1">
                  Contact Email
                </p>
                <p className="text-sm font-medium text-foreground flex items-center gap-2">
                  <Mail className="w-4 h-4 text-muted-foreground shrink-0" />
                  {admin.email}
                </p>
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-1">
                  Phone Number
                </p>
                <p className="text-sm font-medium text-foreground flex items-center gap-2">
                  <Phone className="w-4 h-4 text-muted-foreground shrink-0" />
                  {admin.phone || 'Not provided'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar: Status & Activity */}
        <div className="space-y-6">
          {/* Status Card */}
          <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
            <h3 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground mb-4">
              Account Status
            </h3>

            <div
              className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-md border text-sm font-medium capitalize mb-4 ${getStatusColor(admin.status)}`}
            >
              {getStatusIcon(admin.status)}
              {admin.status} Account
            </div>

            <div className="space-y-4">
              <div className="bg-secondary/50 rounded-lg p-3 border border-border">
                <p className="text-xs font-medium text-muted-foreground mb-1 flex items-center gap-2">
                  <Activity className="w-3.5 h-3.5" /> Total Actions Logged
                </p>
                <p className="text-xl font-bold text-foreground">
                  {admin.actionsLogged?.toLocaleString() || 0}
                </p>
              </div>

              <div className="bg-secondary/50 rounded-lg p-3 border border-border">
                <p className="text-xs font-medium text-muted-foreground mb-1 flex items-center gap-2">
                  <Clock className="w-3.5 h-3.5" /> Last Login
                </p>
                <p className="text-sm font-medium text-foreground">
                  {admin.lastLoginAt
                    ? new Date(admin.lastLoginAt).toLocaleString()
                    : 'Never logged in'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
