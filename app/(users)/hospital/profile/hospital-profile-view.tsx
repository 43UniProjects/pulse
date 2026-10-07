import {
  Building2,
  MapPin,
  Phone,
  Mail,
  Edit3,
  Globe,
  ShieldCheck,
  Clock,
  Activity,
  Users,
} from 'lucide-react';
import { HospitalEntity } from '@/types/hospital.type';

export default function HospitalProfileView({
  hospital,
  onEdit,
}: {
  hospital: HospitalEntity;
  onEdit: () => void;
}) {
  const formatType = (type: string) => {
    return type
      .split('_')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'verified':
        return 'text-green-600 bg-green-500/10 border-green-500/20';
      case 'pending':
        return 'text-yellow-600 bg-yellow-500/10 border-yellow-500/20';
      case 'rejected':
      case 'suspended':
        return 'text-red-600 bg-red-500/10 border-red-500/20';
      default:
        return 'text-muted-foreground bg-secondary border-border';
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-border pb-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            Facility Profile
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage your hospital information and emergency coordination details.
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
        {/* Main Identity Card (Spans 2 columns on large screens) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-card border border-border rounded-xl p-6 shadow-sm flex flex-col sm:flex-row items-center sm:items-start gap-6">
            {/* Hospital Avatar */}
            <div className="shrink-0 w-24 h-24 rounded-2xl bg-primary/10 border border-primary/20 flex flex-col items-center justify-center text-primary">
              <Building2 className="w-10 h-10 opacity-80" />
            </div>

            {/* Core Info */}
            <div className="flex-1 text-center sm:text-left space-y-2 mt-2">
              <h2 className="text-2xl font-semibold text-foreground">
                {hospital.name}
              </h2>
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-sm text-muted-foreground">
                <span className="flex items-center justify-center sm:justify-start gap-1.5">
                  <Building2 className="w-4 h-4" />{' '}
                  {formatType(hospital.facilityType)}
                </span>
                <span className="hidden sm:inline">•</span>
                <span className="flex items-center justify-center sm:justify-start gap-1.5">
                  <MapPin className="w-4 h-4" /> {hospital.city}
                </span>
              </div>
            </div>
          </div>

          {/* Contact & Location Details */}
          <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
            <h3 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground mb-4">
              Contact & Location
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-1">
                  Department Email
                </p>
                <p className="text-sm font-medium text-foreground flex items-center gap-2">
                  <Mail className="w-4 h-4 text-muted-foreground" />
                  {hospital.email}
                </p>
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-1">
                  Hotline
                </p>
                <p className="text-sm font-medium text-foreground flex items-center gap-2">
                  <Phone className="w-4 h-4 text-muted-foreground" />
                  {hospital.hotline}
                </p>
              </div>
              <div className="sm:col-span-2">
                <p className="text-xs font-medium text-muted-foreground mb-1">
                  Full Address
                </p>
                <p className="text-sm font-medium text-foreground flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-muted-foreground shrink-0" />
                  {hospital.address}
                </p>
              </div>
              {hospital.website && (
                <div className="sm:col-span-2">
                  <p className="text-xs font-medium text-muted-foreground mb-1">
                    Website
                  </p>
                  <p className="text-sm font-medium text-primary flex items-center gap-2 hover:underline cursor-pointer">
                    <Globe className="w-4 h-4 shrink-0" />
                    {hospital.website}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar: Coordinator & Status */}
        <div className="space-y-6">
          {/* Status Card */}
          <div className="bg-card border border-border rounded-xl p-6 shadow-sm relative overflow-hidden">
            {/* Accent line based on verification status */}
            <div
              className={`absolute top-0 left-0 right-0 h-1.5 ${hospital.verificationStatus === 'verified' ? 'bg-primary' : 'bg-yellow-500'}`}
            />

            <h3 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground mb-4 mt-1">
              Account Status
            </h3>

            <div
              className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-md border text-sm font-medium capitalize mb-4 ${getStatusColor(hospital.verificationStatus)}`}
            >
              {hospital.verificationStatus === 'verified' ? (
                <ShieldCheck className="w-4 h-4" />
              ) : (
                <Clock className="w-4 h-4" />
              )}
              {hospital.verificationStatus} Facility
            </div>

            <div className="bg-secondary/50 rounded-lg p-3 border border-border">
              <p className="text-xs text-muted-foreground flex items-start gap-2">
                <Activity className="w-4 h-4 shrink-0 text-primary mt-0.5" />
                <span>
                  Active Requests:{' '}
                  <strong className="text-foreground">
                    {hospital.activeRequestsCount || 0}
                  </strong>{' '}
                  ongoing emergencies.
                </span>
              </p>
            </div>
          </div>

          {/* Coordinator Card */}
          <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
            <h3 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground mb-4 flex items-center gap-2">
              <Users className="w-4 h-4" /> Coordinator
            </h3>

            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium text-foreground">
                  {hospital.coordinator.name}
                </p>
                <p className="text-xs text-muted-foreground">
                  {hospital.coordinator.designation}
                </p>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium text-foreground flex items-center gap-2">
                  <Phone className="w-4 h-4 text-muted-foreground" />
                  {hospital.coordinator.contactNumber}
                </p>
                <p className="text-sm font-medium text-foreground flex items-center gap-2 break-all">
                  <Mail className="w-4 h-4 text-muted-foreground shrink-0" />
                  {hospital.coordinator.email}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
