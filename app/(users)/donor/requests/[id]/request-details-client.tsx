'use client';

import { useState } from 'react';
import Link from 'next/link';
import { MapPin } from 'lucide-react';

type RequestDetails = {
  hospital: string;
  address: string;
  bloodGroup: string;
  quantity: string;
  urgency: 'Critical' | 'High' | 'Medium';
  notes: string;
};

const requestData: Record<string, RequestDetails> = {
  '1': {
    hospital: 'Nawaloka Hospital',
    address: 'Deshamanya H. K. Dharmadasa Mawatha, Colombo 02',
    bloodGroup: 'O+',
    quantity: '2 units',
    urgency: 'Critical',
    notes:
      'Needed for emergency surgery scheduled at 6:00 AM. Please arrive ASAP.',
  },
  '2': {
    hospital: 'Asiri Central Hospital',
    address: 'Norris Canal Road, Colombo 10',
    bloodGroup: 'B+',
    quantity: '1 unit',
    urgency: 'High',
    notes: 'For a patient in the ICU. Preferred within 4 hours.',
  },
  '3': {
    hospital: 'Lanka Hospitals',
    address: 'Narahenpita Road, Colombo 05',
    bloodGroup: 'A-',
    quantity: '3 units',
    urgency: 'Medium',
    notes: 'Elective surgery tomorrow morning. Advance planning.',
  },
};

export default function RequestDetailClient({ id }: { id: string }) {
  const req = requestData[id] ?? requestData['1'];
  const [status, setStatus] = useState<'Pending' | 'Accepted' | 'Declined'>(
    'Pending',
  );

  // Mapped to Clinical Precision tokens
  const statusStyles = {
    Pending: 'bg-secondary text-secondary-foreground border border-border',
    Accepted:
      'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20',
    Declined: 'bg-destructive/15 text-destructive border border-destructive/20',
  };

  const urgencyColors = {
    Critical: 'bg-destructive/15 text-destructive border border-destructive/20',
    High: 'bg-orange-500/15 text-orange-600 dark:text-orange-400 border border-orange-500/20',
    Medium: 'bg-secondary text-secondary-foreground border border-border',
  };

  return (
    <div className="p-8 max-w-4xl mx-auto font-sans">
      {/* Breadcrumbs */}
      <div className="mb-6 flex items-center gap-2">
        <Link
          href="/donor/dashboard"
          className="text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          Dashboard
        </Link>
        <span className="text-border">/</span>
        <span className="text-sm text-foreground">Request Detail</span>
      </div>

      {/* Clinical Card Wrapper */}
      <div className="bg-card border border-border rounded-lg overflow-hidden shadow-sm">
        {/* Header */}
        <div className="p-6 border-b border-border flex items-start justify-between bg-card">
          <div>
            <h1 className="font-semibold text-xl text-card-foreground mb-1">
              {req.hospital}
            </h1>
            <p className="text-sm text-muted-foreground">{req.address}</p>
          </div>
          <span
            className={`text-xs font-medium px-2.5 py-1 rounded-sm ${statusStyles[status]}`}
          >
            {status}
          </span>
        </div>

        {/* Map Placeholder */}
        <div className="bg-input/50 h-40 flex items-center justify-center border-b border-border">
          <div className="text-center text-muted-foreground flex flex-col items-center gap-2">
            <MapPin className="w-6 h-6 opacity-50" />
            <div className="text-xs uppercase tracking-widest font-medium">
              Map Integration Pending
            </div>
            <div className="text-xs opacity-70 font-tabular">{req.address}</div>
          </div>
        </div>

        {/* Data Grid */}
        <div className="p-6 grid grid-cols-2 md:grid-cols-4 gap-6 bg-card">
          <div>
            <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
              Blood Group
            </div>
            <div className="font-semibold font-tabular text-3xl text-card-foreground">
              {req.bloodGroup}
            </div>
          </div>
          <div>
            <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
              Quantity
            </div>
            <div className="font-semibold font-tabular text-3xl text-card-foreground">
              {req.quantity}
            </div>
          </div>
          <div className="col-span-2 md:col-span-1">
            <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
              Urgency
            </div>
            <span
              className={`inline-block text-xs font-medium px-2.5 py-1 rounded-sm ${urgencyColors[req.urgency]}`}
            >
              {req.urgency}
            </span>
          </div>
          <div className="col-span-2 md:col-span-4 border-t border-border mt-2 pt-6">
            <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
              Clinical Notes
            </div>
            <div className="text-sm text-card-foreground leading-relaxed">
              {req.notes}
            </div>
          </div>
        </div>

        {/* Action Bar */}
        <div className="px-6 pb-6 pt-2 flex items-center gap-3 bg-card">
          {status === 'Pending' ? (
            <>
              <button
                onClick={() => setStatus('Accepted')}
                className="bg-primary text-primary-foreground font-medium text-sm px-6 py-2.5 rounded-md hover:bg-red-700 transition-colors focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background"
              >
                Accept Request
              </button>
              <button
                onClick={() => setStatus('Declined')}
                className="bg-transparent border border-border text-foreground font-medium text-sm px-6 py-2.5 rounded-md hover:bg-secondary transition-colors"
              >
                Decline
              </button>
            </>
          ) : (
            <button
              onClick={() => setStatus('Pending')}
              className="text-xs text-muted-foreground hover:text-foreground transition-colors underline underline-offset-4"
            >
              Undo response
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
