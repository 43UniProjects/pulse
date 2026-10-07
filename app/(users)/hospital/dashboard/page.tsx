import { Metadata } from 'next';
import Link from 'next/link';
import mongoose from 'mongoose';

export const metadata: Metadata = { title: 'Hospital Dashboard' };

// --- 1. Static ObjectIds for Relational Integrity ---
const MOCK_HOSPITAL_ID = new mongoose.Types.ObjectId().toString();
const MOCK_REQ_ID_1 = new mongoose.Types.ObjectId().toString();
const MOCK_REQ_ID_2 = new mongoose.Types.ObjectId().toString();
const MOCK_REQ_ID_3 = new mongoose.Types.ObjectId().toString();
const MOCK_REQ_ID_4 = new mongoose.Types.ObjectId().toString();

// --- 2. Mock Donation Requests ---
export const requests = [
  {
    _id: MOCK_REQ_ID_1,
    requestId: 'REQ-8023',
    hospitalId: MOCK_HOSPITAL_ID,
    hospitalName: 'Nawaloka Hospital',
    address: 'Deshamanya Mw, Colombo 02',
    location: { type: 'Point', coordinates: [79.8511, 6.9271] },
    bloodGroup: 'O+',
    quantity: 2,
    urgency: 'high',
    status: 'pending',
    radiusKm: 10,
    notes: 'Urgent requirement for cardiac surgery.',
    createdAt: new Date('2026-10-07T08:30:00Z'),
  },
  {
    _id: MOCK_REQ_ID_2,
    requestId: 'REQ-8024',
    hospitalId: MOCK_HOSPITAL_ID,
    hospitalName: 'Nawaloka Hospital',
    address: 'Deshamanya Mw, Colombo 02',
    location: { type: 'Point', coordinates: [79.8511, 6.9271] },
    bloodGroup: 'A-',
    quantity: 1,
    urgency: 'normal',
    status: 'completed',
    radiusKm: 5,
    notes: 'Standard restock for O.PD.',
    createdAt: new Date('2026-10-06T14:15:00Z'),
  },
  {
    _id: MOCK_REQ_ID_3,
    requestId: 'REQ-8025',
    hospitalId: MOCK_HOSPITAL_ID,
    hospitalName: 'Nawaloka Hospital',
    address: 'Deshamanya Mw, Colombo 02',
    location: { type: 'Point', coordinates: [79.8511, 6.9271] },
    bloodGroup: 'B+',
    quantity: 3,
    urgency: 'critical',
    status: 'pending',
    radiusKm: 20,
    notes: 'Emergency trauma patient. Immediate requirement.',
    createdAt: new Date('2026-10-07T09:45:00Z'),
  },
  {
    _id: MOCK_REQ_ID_4,
    requestId: 'REQ-8026',
    hospitalId: MOCK_HOSPITAL_ID,
    hospitalName: 'Nawaloka Hospital',
    address: 'Deshamanya Mw, Colombo 02',
    location: { type: 'Point', coordinates: [79.8511, 6.9271] },
    bloodGroup: 'AB+',
    quantity: 1,
    urgency: 'normal',
    status: 'expired',
    radiusKm: 10,
    notes: 'Scheduled transfusion, patient discharged early.',
    createdAt: new Date('2026-10-01T11:20:00Z'),
  },
];

// --- 3. Mock Donation Responses ---
export const mockDonationResponses = [
  // Responses for REQ-8023 (O+ High Urgency)
  {
    _id: new mongoose.Types.ObjectId().toString(),
    donationId: 'DON-20261007-001',
    requestId: MOCK_REQ_ID_1,
    donorId: new mongoose.Types.ObjectId().toString(),
    hospitalId: MOCK_HOSPITAL_ID,
    bloodGroup: 'O+',
    units: 1,
    status: 'pending', // Awaiting hospital/donor final confirmation
    donationDate: new Date('2026-10-07T08:45:00Z'),
    screeningResults: {
      hiv: 'pending',
      hepatitisB: 'pending',
      hepatitisC: 'pending',
      syphilis: 'pending',
    },
    createdAt: new Date('2026-10-07T08:45:00Z'),
    updatedAt: new Date('2026-10-07T08:45:00Z'),
  },
  {
    _id: new mongoose.Types.ObjectId().toString(),
    donationId: 'DON-20261007-002',
    requestId: MOCK_REQ_ID_1,
    donorId: new mongoose.Types.ObjectId().toString(),
    hospitalId: MOCK_HOSPITAL_ID,
    bloodGroup: 'O+',
    units: 1,
    status: 'accepted', // Donor is confirmed/on the way
    donationDate: new Date('2026-10-07T09:10:00Z'),
    screeningResults: {
      hiv: 'pending',
      hepatitisB: 'pending',
      hepatitisC: 'pending',
      syphilis: 'pending',
    },
    createdAt: new Date('2026-10-07T09:10:00Z'),
    updatedAt: new Date('2026-10-07T09:10:00Z'),
  },

  // Responses for REQ-8024 (A- Completed)
  {
    _id: new mongoose.Types.ObjectId().toString(),
    donationId: 'DON-20261006-089',
    requestId: MOCK_REQ_ID_2,
    donorId: new mongoose.Types.ObjectId().toString(),
    hospitalId: MOCK_HOSPITAL_ID,
    bloodGroup: 'A-',
    units: 1,
    status: 'completed', // Donation physically finished
    donationDate: new Date('2026-10-06T14:30:00Z'),
    expiryDate: new Date('2026-11-17T14:30:00Z'),
    batchNumber: 'BAT-A-NEG-4412',
    clinicalNotes: 'Donation successful. Standard screening passed.',
    screeningResults: {
      hiv: 'negative',
      hepatitisB: 'negative',
      hepatitisC: 'negative',
      syphilis: 'negative',
      hemoglobinLevel: '14.2',
    },
    createdAt: new Date('2026-10-06T14:30:00Z'),
    updatedAt: new Date('2026-10-06T18:00:00Z'),
  },
];

// --- 4. UI Component & Styling Config ---
// Covers both Request statuses and Donation statuses
const statusStyles: Record<string, string> = {
  pending:
    'bg-orange-500/10 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400',
  accepted:
    'bg-blue-500/10 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400',
  completed:
    'bg-emerald-500/10 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400',
  declined:
    'bg-destructive/10 dark:bg-destructive/20 text-destructive dark:text-red-400',
  expired: 'bg-gray-500/10 dark:bg-gray-900/30 text-muted-foreground',
};

export default function HospitalDashboard() {
  return (
    <div className="p-8">
      {/* HEADER */}
      <div className="flex items-center justify-between mb-6 bg-card rounded-lg border border-border px-5 py-4 shadow-sm">
        <div>
          <h1 className="font-display font-bold text-2xl text-foreground mb-1">
            Hospital Dashboard
          </h1>
          <p className="text-sm text-muted-foreground">Nawaloka Hospital</p>
        </div>
        <Link
          href="/hospital/post-request"
          className="bg-primary text-primary-foreground font-medium text-sm px-4 py-2 rounded-md hover:bg-primary/90 transition-colors shadow-sm hover:shadow-md"
        >
          + Post New Request
        </Link>
      </div>

      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <div className="px-5 py-3 border-b border-border">
          <h2 className="font-display font-semibold text-sm text-muted-foreground uppercase tracking-wider">
            All Blood Requests
          </h2>
        </div>

        {/* DESKTOP TABLE VIEW */}
        <div className="overflow-x-auto hidden md:block">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left bg-secondary/30">
                <th className="px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Blood Group
                </th>
                <th className="px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Quantity
                </th>
                <th className="px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Radius
                </th>
                <th className="px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Status
                </th>
                <th className="px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Date Posted
                </th>
                <th className="px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Responses
                </th>
                <th className="px-5 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {requests.map((r, i) => {
                // Dynamically calculate responses matching the backend relational model
                // Only counting responses that are 'pending', 'accepted', or 'completed' (ignoring declined)
                const responseCount = mockDonationResponses.filter(
                  (res) => res.requestId === r._id && res.status !== 'declined',
                ).length;

                return (
                  <tr
                    key={r._id}
                    className={`border-b border-border hover:bg-secondary/30 transition-colors ${
                      i === requests.length - 1 ? 'border-0' : ''
                    }`}
                  >
                    <td className="px-5 py-3.5">
                      <span className="font-semibold text-foreground">
                        {r.bloodGroup}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-muted-foreground font-tabular">
                      {r.quantity} Unit{r.quantity !== 1 ? 's' : ''}
                    </td>
                    <td className="px-5 py-3.5 text-muted-foreground font-tabular">
                      {r.radiusKm} km
                    </td>
                    <td className="px-5 py-3.5">
                      <span
                        className={`text-xs font-medium px-2.5 py-1 rounded-sm capitalize ${statusStyles[r.status]}`}
                      >
                        {r.status}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-muted-foreground font-tabular">
                      {new Intl.DateTimeFormat('en-GB', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                      }).format(r.createdAt)}
                    </td>
                    <td className="px-5 py-3.5 text-muted-foreground font-tabular">
                      <span
                        className={
                          responseCount > 0 ? 'text-primary font-medium' : ''
                        }
                      >
                        {responseCount}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <Link
                        href={`/hospital/tracking/${r._id}`}
                        className="text-xs font-medium text-primary hover:underline"
                      >
                        Track
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* MOBILE CARD VIEW */}
        <div className="block md:hidden">
          <div className="flex flex-col divide-y divide-border">
            {requests.map((r) => {
              const responseCount = mockDonationResponses.filter(
                (res) => res.requestId === r._id && res.status !== 'declined',
              ).length;

              return (
                <div
                  key={r._id}
                  className="p-4 flex flex-col gap-3 hover:bg-secondary/20 transition-colors"
                >
                  <div className="flex justify-between items-start gap-2">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-foreground text-lg">
                        {r.bloodGroup}
                      </span>
                      <span className="text-xs font-medium text-muted-foreground bg-secondary px-2 py-1 rounded-md font-tabular">
                        {r.quantity} Unit{r.quantity !== 1 ? 's' : ''}
                      </span>
                    </div>
                    <span
                      className={`shrink-0 text-xs font-medium px-2.5 py-1 rounded-sm capitalize ${statusStyles[r.status]}`}
                    >
                      {r.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-sm mt-1">
                    <div className="text-muted-foreground">Radius:</div>
                    <div className="text-foreground font-tabular">
                      {r.radiusKm} km
                    </div>

                    <div className="text-muted-foreground">Date Posted:</div>
                    <div className="text-foreground font-tabular">
                      {new Intl.DateTimeFormat('en-GB', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                      }).format(r.createdAt)}
                    </div>

                    <div className="text-muted-foreground">Responses:</div>
                    <div
                      className={`text-foreground font-medium font-tabular ${responseCount > 0 ? 'text-primary' : ''}`}
                    >
                      {responseCount}
                    </div>
                  </div>

                  <div className="pt-3 mt-1 border-t border-border/50 flex justify-end">
                    <Link
                      href={`/hospital/tracking/${r._id}`}
                      className="text-xs font-medium bg-primary text-primary-foreground px-4 py-2 w-full text-center rounded-md hover:bg-primary/90 transition-colors shadow-sm"
                    >
                      Track Request
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
