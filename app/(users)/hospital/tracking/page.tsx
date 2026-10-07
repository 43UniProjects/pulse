'use client';

import { useState } from 'react';
import {
  MapPin,
  Activity,
  Droplet,
  Phone,
  Clock,
  CheckCircle,
} from 'lucide-react';

import {
  REQUEST_URGENCY_LEVEL,
  REQUEST_STATUS,
} from '@/types/donor-request.type';

import { RequestUrgency, RequestStatus } from '@/types/donor-request.type';

interface MockRespondingDonor {
  _id: string;
  name: string;
  phone: string;
  bloodGroup: string;
  etaMins: number | null;
  status: RequestStatus;
}

interface MockTrackingRequest {
  _id: string;
  bloodGroup: string;
  urgency: RequestUrgency;
  requiredUnits: number;
  fulfilledUnits: number;
  createdAt: Date;
  donationResponses: MockRespondingDonor[];
}

// --- 2. Mock Data Initialization ---
const mockDonationRequests: MockTrackingRequest[] = [
  {
    _id: 'req_001',
    bloodGroup: 'O-',
    urgency: REQUEST_URGENCY_LEVEL[0],
    requiredUnits: 5,
    fulfilledUnits: 2,
    createdAt: new Date(Date.now() - 1000 * 60 * 30),
    donationResponses: [
      {
        _id: 'don_1',
        name: 'Kamal Perera',
        phone: '+94 77 123 4567',
        bloodGroup: 'O-',
        etaMins: 12,
        status: REQUEST_STATUS[0],
      },
      {
        _id: 'don_2',
        name: 'Nimali Fernando',
        phone: '+94 71 987 6543',
        bloodGroup: 'O-',
        etaMins: null,
        status: REQUEST_STATUS[2],
      },
    ],
  },
  {
    _id: 'req_002',
    bloodGroup: 'A+',
    urgency: REQUEST_URGENCY_LEVEL[1],
    requiredUnits: 3,
    fulfilledUnits: 0,
    createdAt: new Date(Date.now() - 1000 * 60 * 120),
    donationResponses: [
      {
        _id: 'don_3',
        name: 'Suresh Silva',
        phone: '+94 70 555 1234',
        bloodGroup: 'A+',
        etaMins: 25,
        status: REQUEST_STATUS[1],
      },
    ],
  },
];

// --- 3. Component UI ---
export default function HospitalTrackingPage() {
  const [selectedRequest, setSelectedRequest] = useState<MockTrackingRequest>(
    mockDonationRequests[0],
  );

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Emergency Tracking
          </h1>
          <p className="text-muted-foreground mt-1">
            Monitor active blood requests and incoming donors in real-time.
          </p>
        </div>
        {/* Uses the primary brand color with opacity for the background */}
        <div className="flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-md font-medium border border-primary/20">
          <Activity className="w-5 h-5 animate-pulse" />
          <span>{mockDonationRequests.length} Active Requests</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Active Requests List */}
        <div className="lg:col-span-1 space-y-4">
          <h2 className="text-lg font-semibold text-foreground">
            Active Requests
          </h2>
          <div className="space-y-3">
            {mockDonationRequests.map((donationRequest) => (
              <button
                key={donationRequest._id}
                onClick={() => setSelectedRequest(donationRequest)}
                className={`w-full text-left p-4 rounded-lg border transition-all ${
                  selectedRequest._id === donationRequest._id
                    ? 'border-primary bg-primary/5 shadow-sm'
                    : 'border-border bg-card hover:border-primary/50'
                }`}
              >
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-2 text-foreground">
                    <Droplet className="w-5 h-5 text-primary" />
                    <span className="font-bold text-lg">
                      {donationRequest.bloodGroup}
                    </span>
                  </div>
                  <span
                    className={`text-xs font-bold px-2 py-1 rounded-sm uppercase ${
                      donationRequest.urgency === 'critical'
                        ? 'bg-destructive/10 text-destructive'
                        : 'bg-orange-500/10 text-orange-600 dark:text-orange-400'
                    }`}
                  >
                    {donationRequest.urgency}
                  </span>
                </div>
                <div className="text-sm text-muted-foreground flex justify-between font-tabular">
                  <span>
                    Units: {donationRequest.fulfilledUnits} /{' '}
                    {donationRequest.requiredUnits}
                  </span>
                  <span>
                    {donationRequest.donationResponses.length} Responding
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Right Column: Tracking Details */}
        <div className="lg:col-span-2">
          <div className="bg-card text-card-foreground border border-border rounded-lg overflow-hidden shadow-sm">
            {/* Tracking Header */}
            <div className="p-6 border-b border-border flex justify-between items-center bg-secondary/30">
              <div>
                <h3 className="text-xl font-bold flex items-center gap-2 text-foreground">
                  Tracking{' '}
                  <span className="text-primary">
                    {selectedRequest.bloodGroup}
                  </span>{' '}
                  Request
                </h3>
                <p className="text-sm text-muted-foreground mt-1 font-tabular">
                  Request ID: {selectedRequest._id}
                </p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-foreground font-tabular">
                  {(selectedRequest.fulfilledUnits /
                    selectedRequest.requiredUnits) *
                    100}
                  %
                </div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider">
                  Fulfillment
                </p>
              </div>
            </div>

            {/* Responding Donors List */}
            <div className="p-6">
              <h4 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-muted-foreground" />
                Live Donor Status
              </h4>

              {selectedRequest.donationResponses.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">
                  Waiting for donors to accept this request...
                </p>
              ) : (
                <div className="space-y-4">
                  {selectedRequest.donationResponses.map((donationResponse) => (
                    <div
                      key={donationResponse._id}
                      className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 rounded-md border border-border bg-secondary/20 gap-4"
                    >
                      <div>
                        <p className="font-semibold text-foreground">
                          {donationResponse.name}
                        </p>
                        <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1 font-tabular">
                          <Phone className="w-3 h-3" /> {donationResponse.phone}
                        </p>
                      </div>

                      <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
                        {/* ETA Badge */}
                        {donationResponse.status === 'pending' ? (
                          <div className="flex items-center gap-1.5 text-blue-600 dark:text-blue-400 bg-blue-500/10 px-3 py-1 rounded-sm text-sm font-medium font-tabular">
                            <Clock className="w-4 h-4" />
                            ETA: {donationResponse.etaMins} mins
                          </div>
                        ) : (
                          <div className="flex items-center gap-1.5 text-green-600 dark:text-green-400 bg-green-500/10 px-3 py-1 rounded-sm text-sm font-medium">
                            <CheckCircle className="w-4 h-4" />
                            Arrived
                          </div>
                        )}

                        {/* Action Button */}
                        <button className="px-4 py-2 text-sm font-medium bg-background text-foreground border border-input rounded-md hover:bg-accent hover:text-accent-foreground transition-colors">
                          Update Status
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
