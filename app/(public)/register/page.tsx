'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

export default function Register() {
  const [tab, setTab] = useState<'donor' | 'hospital'>('donor');
  const router = useRouter();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    router.push(tab === 'donor' ? '/donor' : '/hospital');
  }

  return (
    <div className="min-h-[calc(100vh-56px)] flex items-center justify-center app-bg px-4 py-10">
      <div className="w-full max-w-md glass border rounded-2xl p-8 shadow-lg">
        <div className="mb-6">
          <h1 className="font-display font-bold text-2xl text-black mb-1">
            Create account
          </h1>
          <p className="text-sm text-gray-500">Join the Pulse network</p>
        </div>

        {/* Tabs */}
        <div className="flex border border-gray-300 rounded-lg overflow-hidden mb-6">
          <button
            onClick={() => setTab('donor')}
            className={`flex-1 text-sm font-medium py-2 transition-colors border-r border-gray-300 ${tab === 'donor' ? 'bg-red-600 text-white border-red-600' : 'bg-white/70 text-gray-600 hover:bg-white'}`}
          >
            Donor
          </button>
          <button
            onClick={() => setTab('hospital')}
            className={`flex-1 text-sm font-medium py-2 transition-colors ${tab === 'hospital' ? 'bg-red-600 text-white' : 'bg-white/70 text-gray-600 hover:bg-white'}`}
          >
            Hospital
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {tab === 'donor' ? (
            <>
              <Field label="Full Name" type="text" placeholder="Kamal Perera" />
              <Field
                label="Email"
                type="email"
                placeholder="kamal@example.lk"
              />
              <Field label="Password" type="password" placeholder="••••••••" />
              <div>
                <label className="text-xs font-medium text-gray-600 block mb-1">
                  Blood Group
                </label>
                <select className="w-full border border-gray-200 rounded px-3 py-2 text-sm outline-none focus:border-gray-400 transition-colors bg-white">
                  <option value="">Select blood group</option>
                  {bloodGroups.map((g) => (
                    <option key={g}>{g}</option>
                  ))}
                </select>
              </div>
              <Field
                label="Phone (for SMS alerts)"
                type="tel"
                placeholder="+94 77 123 4567"
              />
              <Field
                label="Location / Address"
                type="text"
                placeholder="Nugegoda, Colombo"
              />
              <Field label="Date of Birth" type="date" placeholder="" />
              <div className="flex items-start gap-2 rounded border border-gray-100 bg-gray-50 px-3 py-2.5">
                <span className="text-red-600 text-sm leading-5">✆</span>
                <p className="text-xs text-gray-500 leading-relaxed">
                  You&apos;ll receive an{' '}
                  <span className="font-medium text-gray-700">
                    SMS notification
                  </span>{' '}
                  whenever your blood type is needed nearby. Before your first
                  donation, your health status must be
                  <span className="font-medium text-gray-700">
                    {' '}
                    verified by a hospital
                  </span>
                  .
                </p>
              </div>
            </>
          ) : (
            <>
              <Field
                label="Hospital Name"
                type="text"
                placeholder="Nawaloka Hospital"
              />
              <Field
                label="Registration Number"
                type="text"
                placeholder="LK/2018/04521"
              />
              <Field
                label="Email"
                type="email"
                placeholder="admin@nawaloka.lk"
              />
              <Field label="Password" type="password" placeholder="••••••••" />
              <Field label="Phone" type="tel" placeholder="+94 11 254 4444" />
              <Field
                label="Address"
                type="text"
                placeholder="Deshamanya H. K. Dharmadasa Mw, Colombo 02"
              />
              <Field
                label="Contact Person Name"
                type="text"
                placeholder="Dr. Nimali Fernando"
              />
            </>
          )}

          <button
            type="submit"
            className="bg-red-600 text-white font-medium text-sm py-2.5 rounded hover:bg-red-700 transition-colors mt-1 shadow-sm hover:shadow-md"
          >
            Create Account
          </button>
        </form>

        <div className="mt-5 pt-5 border-t border-gray-100 text-center">
          <p className="text-sm text-gray-500">
            Already have an account?{' '}
            <Link
              href="/login"
              className="text-red-600 font-medium hover:underline"
            >
              Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  type,
  placeholder,
}: {
  label: string;
  type: string;
  placeholder: string;
}) {
  return (
    <div>
      <label className="text-xs font-medium text-gray-600 block mb-1">
        {label}
      </label>
      <input
        type={type}
        placeholder={placeholder}
        className="w-full border border-gray-200 rounded px-3 py-2 text-sm outline-none focus:border-gray-400 transition-colors"
      />
    </div>
  );
}
