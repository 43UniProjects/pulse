'use client';
import { useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';

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

const urgencyColors: Record<string, string> = {
  Critical: 'bg-red-100 text-red-700',
  High: 'bg-orange-100 text-orange-700',
  Medium: 'bg-yellow-100 text-yellow-700',
};

export default function RequestDetail() {
  const { id } = useParams();
  const stringId = Array.isArray(id) ? id[0] : id;
  const req = requestData[stringId ?? '1'] ?? requestData['1'];
  const [status, setStatus] = useState<'Pending' | 'Accepted' | 'Declined'>(
    'Pending',
  );

  const statusStyles = {
    Pending: 'bg-gray-100 text-gray-600',
    Accepted: 'bg-green-100 text-green-700',
    Declined: 'bg-red-100 text-red-600',
  };

  return (
    <div className="p-8 max-w-2xl">
      <div className="mb-6 flex items-center gap-2">
        <Link
          href="/donor"
          className="text-sm text-gray-400 hover:text-black transition-colors"
        >
          Dashboard
        </Link>
        <span className="text-gray-300">/</span>
        <span className="text-sm text-gray-700">Request Detail</span>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-gray-100 flex items-start justify-between">
          <div>
            <h1 className="font-display font-bold text-xl text-black mb-0.5">
              {req.hospital}
            </h1>
            <p className="text-sm text-gray-500">{req.address}</p>
          </div>
          <span
            className={`text-xs font-semibold px-2.5 py-1 rounded-full ${statusStyles[status]}`}
          >
            {status}
          </span>
        </div>

        {/* Map placeholder */}
        <div className="bg-gray-100 h-40 flex items-center justify-center border-b border-gray-100">
          <div className="text-center text-gray-400">
            <div className="text-2xl mb-1">📍</div>
            <div className="text-xs">Map placeholder — {req.address}</div>
          </div>
        </div>

        {/* Details */}
        <div className="p-6 grid grid-cols-2 gap-5">
          <div>
            <div className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">
              Blood Group
            </div>
            <div className="font-display font-bold text-2xl text-black">
              {req.bloodGroup}
            </div>
          </div>
          <div>
            <div className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">
              Quantity Needed
            </div>
            <div className="font-display font-bold text-2xl text-black">
              {req.quantity}
            </div>
          </div>
          <div>
            <div className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">
              Urgency Level
            </div>
            <span
              className={`text-xs font-semibold px-2.5 py-1 rounded-full ${urgencyColors[req.urgency]}`}
            >
              {req.urgency}
            </span>
          </div>
          <div>
            <div className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">
              Notes
            </div>
            <div className="text-sm text-gray-700 leading-relaxed">
              {req.notes}
            </div>
          </div>
        </div>

        {/* Actions */}
        {status === 'Pending' && (
          <div className="px-6 pb-6 flex gap-3">
            <button
              onClick={() => setStatus('Accepted')}
              className="bg-red-600 text-white font-medium text-sm px-5 py-2 rounded hover:bg-red-700 transition-colors shadow-sm hover:shadow-md"
            >
              Accept Request
            </button>
            <button
              onClick={() => setStatus('Declined')}
              className="border border-gray-200 text-gray-600 font-medium text-sm px-5 py-2 rounded hover:bg-gray-50 transition-colors shadow-sm hover:shadow-md"
            >
              Decline
            </button>
          </div>
        )}
        {status !== 'Pending' && (
          <div className="px-6 pb-6">
            <button
              onClick={() => setStatus('Pending')}
              className="text-xs text-gray-400 hover:text-gray-600 transition-colors underline"
            >
              Undo response
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
