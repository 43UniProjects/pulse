import { useState } from 'react';

const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

export default function DonorProfile() {
  const [available, setAvailable] = useState(true);
  const [saved, setSaved] = useState(false);

  function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div className="p-8 max-w-lg">
      <div className="mb-6 glass rounded-xl border px-5 py-4 shadow-sm">
        <h1 className="font-display font-bold text-2xl text-black mb-1">
          My Profile
        </h1>
        <p className="text-sm text-gray-500">Update your donor information</p>
      </div>

      <form
        onSubmit={handleSave}
        className="bg-white border border-gray-200 rounded-lg p-6 flex flex-col gap-5"
      >
        <div>
          <label className="text-xs font-medium text-gray-600 block mb-1">
            Full Name
          </label>
          <input
            defaultValue="Kamal Perera"
            className="w-full border border-gray-200 rounded px-3 py-2 text-sm outline-none focus:border-gray-400 transition-colors"
          />
        </div>

        <div>
          <label className="text-xs font-medium text-gray-600 block mb-1">
            Blood Group
          </label>
          <select
            defaultValue="O+"
            className="w-full border border-gray-200 rounded px-3 py-2 text-sm outline-none focus:border-gray-400 transition-colors bg-white"
          >
            {bloodGroups.map((g) => (
              <option key={g}>{g}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-xs font-medium text-gray-600 block mb-1">
            Phone
          </label>
          <input
            defaultValue="+94 77 123 4567"
            className="w-full border border-gray-200 rounded px-3 py-2 text-sm outline-none focus:border-gray-400 transition-colors"
          />
        </div>

        <div>
          <label className="text-xs font-medium text-gray-600 block mb-1">
            Location
          </label>
          <input
            defaultValue="Nugegoda, Colombo"
            className="w-full border border-gray-200 rounded px-3 py-2 text-sm outline-none focus:border-gray-400 transition-colors"
          />
        </div>

        <div>
          <label className="text-xs font-medium text-gray-600 block mb-1">
            Last Donation Date
          </label>
          <input
            readOnly
            value="12 March 2026"
            className="w-full border border-gray-100 rounded px-3 py-2 text-sm bg-gray-50 text-gray-400 cursor-not-allowed"
          />
          <p className="text-xs text-gray-400 mt-1">
            This field is updated automatically after each donation.
          </p>
        </div>

        {/* Health Verification Status */}
        <div className="flex items-center justify-between py-3 border-t border-gray-100">
          <div>
            <div className="text-sm font-medium text-black">
              Health Verification
            </div>
            <div className="text-xs text-gray-500">
              Verified by Nawaloka Hospital on 18 Sep 2026
            </div>
          </div>
          <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-green-100 text-green-700 inline-flex items-center gap-1">
            <span aria-hidden>✓</span> Verified
          </span>
        </div>

        {/* Availability Toggle */}
        <div className="flex items-center justify-between py-3 border-t border-gray-100">
          <div>
            <div className="text-sm font-medium text-black">Availability</div>
            <div className="text-xs text-gray-500">
              Receive donation requests when available
            </div>
          </div>
          <button
            type="button"
            onClick={() => setAvailable((a) => !a)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${available ? 'bg-red-600' : 'bg-gray-200'}`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${available ? 'translate-x-6' : 'translate-x-1'}`}
            />
          </button>
        </div>

        <div className="flex items-center gap-3 pt-1">
          <button
            type="submit"
            className="bg-red-600 text-white font-medium text-sm px-5 py-2 rounded hover:bg-red-700 transition-colors shadow-sm hover:shadow-md"
          >
            Save Changes
          </button>
          {saved && (
            <span className="text-xs text-green-600 font-medium">Saved!</span>
          )}
        </div>
      </form>
    </div>
  );
}
