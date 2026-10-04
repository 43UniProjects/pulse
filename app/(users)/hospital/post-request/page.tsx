'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
const radii = ['5 km', '10 km', '20 km'];

export default function PostRequest() {
  const router = useRouter();
  const [radius, setRadius] = useState('10 km');
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => router.push('/hospital'), 1200);
  }

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <div className="mb-6 glass rounded-xl border px-5 py-4 shadow-sm">
        <h1 className="font-display font-bold text-2xl text-foreground mb-1">
          Post Blood Request
        </h1>
        <p className="text-sm text-muted-foreground">
          Broadcast a request to eligible nearby donors
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="bg-card border border-border rounded-lg p-6 flex flex-col gap-5"
      >
        <div>
          <label className="text-xs font-medium text-foreground block mb-1">
            Blood Group Required
          </label>
          <select className="w-full border border-border rounded px-3 py-2 text-sm outline-none focus:border-border transition-colors bg-background">
            <option value="">Select blood group</option>
            {bloodGroups.map((g) => (
              <option key={g}>{g}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-xs font-medium text-foreground block mb-1">
            Quantity (units)
          </label>
          <input
            type="number"
            min={1}
            max={20}
            defaultValue={1}
            className="w-full border border-border rounded px-3 py-2 text-sm outline-none focus:border-border transition-colors bg-background"
          />
        </div>

        <div>
          <label className="text-xs font-medium text-foreground block mb-2">
            Search Radius
          </label>
          <div className="flex gap-2">
            {radii.map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setRadius(r)}
                className={`flex-1 text-sm font-medium py-2 rounded border transition-colors ${
                  radius === r
                    ? 'bg-red-600 text-white border-red-600'
                    : 'bg-transparent text-muted-foreground border-border hover:bg-muted/50'
                }`}
              >
                {r}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="text-xs font-medium text-foreground block mb-1">
            Urgency Level
          </label>
          <select className="w-full border border-border rounded px-3 py-2 text-sm outline-none focus:border-border transition-colors bg-background">
            <option>Critical</option>
            <option>High</option>
            <option>Medium</option>
            <option>Low</option>
          </select>
        </div>

        <div>
          <label className="text-xs font-medium text-foreground block mb-1">
            Additional Notes
          </label>
          <textarea
            rows={3}
            placeholder="Any specific instructions or context for the donor..."
            className="w-full border border-border rounded px-3 py-2 text-sm outline-none focus:border-border transition-colors resize-none bg-background"
          />
        </div>

        <div className="flex items-center gap-3 pt-1">
          <button
            type="submit"
            disabled={submitted}
            className="bg-red-600 text-white font-medium text-sm px-5 py-2 rounded hover:bg-red-700 transition-colors disabled:opacity-60 shadow-sm hover:shadow-md"
          >
            {submitted ? 'Broadcasting...' : 'Post Request'}
          </button>
          {submitted && (
            <span className="text-xs text-green-600 font-medium">
              Request posted! Redirecting...
            </span>
          )}
        </div>
      </form>
    </div>
  );
}
