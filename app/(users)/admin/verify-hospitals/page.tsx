'use client';
import { useState } from 'react';

type HospitalStatus = 'Pending' | 'Approved' | 'Rejected';

type Hospital = {
  id: number;
  name: string;
  regNo: string;
  email: string;
  date: string;
  status: HospitalStatus;
};

const initialHospitals: Hospital[] = [
  {
    id: 1,
    name: 'Asiri Central Hospital, Colombo',
    regNo: 'LK/2024/07821',
    email: 'admin@asiri.lk',
    date: '24 Sep 2026',
    status: 'Pending',
  },
  {
    id: 2,
    name: 'Durdans Hospital, Colombo',
    regNo: 'LK/2024/03145',
    email: 'info@durdans.lk',
    date: '23 Sep 2026',
    status: 'Pending',
  },
  {
    id: 3,
    name: 'Teaching Hospital, Kandy',
    regNo: 'LK/2024/09912',
    email: 'contact@thkandy.lk',
    date: '21 Sep 2026',
    status: 'Pending',
  },
  {
    id: 4,
    name: 'Karapitiya Teaching Hospital, Galle',
    regNo: 'LK/2024/11207',
    email: 'admin@karapitiya.lk',
    date: '20 Sep 2026',
    status: 'Pending',
  },
  {
    id: 5,
    name: 'Base Hospital, Negombo',
    regNo: 'LK/2024/05540',
    email: 'ops@bhnegombo.lk',
    date: '19 Sep 2026',
    status: 'Pending',
  },
  {
    id: 6,
    name: 'Lanka Hospitals, Colombo',
    regNo: 'LK/2024/02318',
    email: 'admin@lankahospitals.lk',
    date: '17 Sep 2026',
    status: 'Approved',
  },
  {
    id: 7,
    name: 'Hemas Hospital, Wattala',
    regNo: 'LK/2023/98812',
    email: 'info@hemashospitals.lk',
    date: '15 Sep 2026',
    status: 'Rejected',
  },
];

const statusStyles: Record<HospitalStatus, string> = {
  Pending:
    'bg-yellow-50 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400',
  Approved:
    'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400',
  Rejected: 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400',
};

export default function VerifyHospitals() {
  const [hospitals, setHospitals] = useState(initialHospitals);

  function update(id: number, status: HospitalStatus) {
    setHospitals((hs) => hs.map((h) => (h.id === id ? { ...h, status } : h)));
  }

  return (
    <div className="p-8">
      <div className="mb-6 glass rounded-xl border px-5 py-4 shadow-sm">
        <h1 className="font-display font-bold text-2xl text-foreground mb-1">
          Verify Hospitals
        </h1>
        <p className="text-sm text-muted-foreground">
          {hospitals.filter((h) => h.status === 'Pending').length} pending
          verifications
        </p>
      </div>

      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <div className="overflow-x-auto hidden md:block">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left bg-muted/50">
                <th className="px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Hospital Name
                </th>
                <th className="px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Reg. Number
                </th>
                <th className="px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Email
                </th>
                <th className="px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Date Applied
                </th>
                <th className="px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Status
                </th>
                <th className="px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {hospitals.map((h, i) => (
                <tr
                  key={h.id}
                  className={`border-b border-border hover:bg-muted/50 transition-colors ${i === hospitals.length - 1 ? 'border-0' : ''}`}
                >
                  <td className="px-5 py-3.5 font-medium text-foreground">
                    {h.name}
                  </td>
                  <td className="px-5 py-3.5 text-muted-foreground font-mono text-xs">
                    {h.regNo}
                  </td>
                  <td className="px-5 py-3.5 text-muted-foreground">
                    {h.email}
                  </td>
                  <td className="px-5 py-3.5 text-muted-foreground">
                    {h.date}
                  </td>
                  <td className="px-5 py-3.5">
                    <span
                      className={`text-xs font-medium px-2 py-0.5 rounded-full ${statusStyles[h.status]}`}
                    >
                      {h.status}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    {h.status === 'Pending' ? (
                      <div className="flex gap-2">
                        <button
                          onClick={() => update(h.id, 'Approved')}
                          className="text-xs font-medium bg-green-600 text-white px-2.5 py-1 rounded hover:bg-green-700 transition-colors shadow-sm hover:shadow-md"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => update(h.id, 'Rejected')}
                          className="text-xs font-medium bg-background dark:bg-red-950/20 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-900/50 px-2.5 py-1 rounded hover:bg-red-50 dark:hover:bg-red-900/40 transition-colors shadow-sm hover:shadow-md"
                        >
                          Reject
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => update(h.id, 'Pending')}
                        className="text-xs text-muted-foreground hover:text-foreground underline transition-colors"
                      >
                        Undo
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* MOBILE CARD VIEW */}
        <div className="block md:hidden">
          <div className="flex flex-col divide-y divide-border">
            {hospitals.map((h) => (
              <div
                key={h.id}
                className="p-4 flex flex-col gap-3 hover:bg-muted/30 transition-colors"
              >
                {/* Name, Reg No and Status */}
                <div className="flex justify-between items-start gap-2">
                  <div>
                    <h3 className="font-semibold text-foreground">{h.name}</h3>
                    <p className="text-xs font-mono text-muted-foreground mt-1">
                      Reg: {h.regNo}
                    </p>
                  </div>
                  <span
                    className={`shrink-0 text-xs font-medium px-2 py-0.5 rounded-full ${statusStyles[h.status]}`}
                  >
                    {h.status}
                  </span>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-2 gap-2 text-sm mt-1">
                  <div className="text-muted-foreground">Email:</div>
                  <div className="text-foreground truncate">{h.email}</div>
                  <div className="text-muted-foreground">Date:</div>
                  <div className="text-foreground">{h.date}</div>
                </div>

                {/* Actions (Buttons) */}
                <div className="pt-3 mt-1 border-t border-border/50 flex justify-end">
                  {h.status === 'Pending' ? (
                    <div className="flex gap-2 w-full sm:w-auto">
                      <button
                        onClick={() => update(h.id, 'Approved')}
                        className="flex-1 sm:flex-none text-xs font-medium bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition-colors shadow-sm"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => update(h.id, 'Rejected')}
                        className="flex-1 sm:flex-none text-xs font-medium bg-background text-red-600 border border-red-200 px-4 py-2 rounded hover:bg-red-50 transition-colors shadow-sm"
                      >
                        Reject
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => update(h.id, 'Pending')}
                      className="text-xs text-muted-foreground hover:text-foreground underline transition-colors py-1"
                    >
                      Undo Action
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
