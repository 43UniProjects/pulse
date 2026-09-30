'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function Login() {
  const router = useRouter();
  const [role, setRole] = useState<'donor' | 'hospital' | 'admin'>('donor');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (role === 'donor') router.push('/donor');
    else if (role === 'hospital') router.push('/hospital');
    else router.push('/admin');
  }

  return (
    <div className="min-h-[calc(100vh-56px)] flex items-center justify-center app-bg px-4">
      <div className="w-full max-w-sm glass border rounded-2xl p-8 shadow-lg">
        <div className="mb-6">
          <h1 className="font-display font-bold text-2xl text-black mb-1">
            Sign in
          </h1>
          <p className="text-sm text-gray-500">Welcome back to Pulse</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="text-xs font-medium text-gray-600 block mb-1">
              Sign in as
            </label>
            <div className="flex gap-2">
              {(['donor', 'hospital', 'admin'] as const).map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setRole(r)}
                  className={`flex-1 text-xs font-medium py-1.5 rounded border transition-colors capitalize ${
                    role === r
                      ? 'bg-red-600 text-white border-red-600'
                      : 'bg-white/70 border-gray-300 text-gray-600 hover:border-gray-400 hover:bg-white'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-gray-600 block mb-1">
              Email address
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full border border-gray-200 rounded px-3 py-2 text-sm outline-none focus:border-gray-400 transition-colors"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-gray-600 block mb-1">
              Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full border border-gray-200 rounded px-3 py-2 text-sm outline-none focus:border-gray-400 transition-colors"
            />
          </div>

          <button
            type="submit"
            className="bg-red-600 text-white font-medium text-sm py-2.5 rounded hover:bg-red-700 transition-colors mt-1 shadow-sm hover:shadow-md"
          >
            Login
          </button>
        </form>

        <div className="mt-5 pt-5 border-t border-gray-100 text-center">
          <p className="text-sm text-gray-500">
            Don&apos;t have an account?{' '}
            <Link
              href="/register"
              className="text-red-600 font-medium hover:underline"
            >
              Register
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
