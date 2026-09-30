'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function HospitalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  return (
    <div className="flex-1 flex app-bg h-0">
      <aside className="w-56 bg-white border-r border-gray-200 flex flex-col shrink-0">
        <nav className="flex-1 p-3 flex flex-col gap-0.5 text-sm font-medium">
          <Link
            href="/hospital/dashboard"
            className={`flex items-center gap-2.5 px-3 py-2 rounded transition-colors ${pathname === '/hospital/dashboard' ? 'bg-red-50 text-red-600' : 'text-gray-600 hover:bg-gray-100 hover:text-black'}`}
          >
            Dashboard
          </Link>
          <Link
            href="/hospital/post-request"
            className={`flex items-center gap-2.5 px-3 py-2 rounded transition-colors ${pathname === '/hospital/post-request' ? 'bg-red-50 text-red-600' : 'text-gray-600 hover:bg-gray-100 hover:text-black'}`}
          >
            Post Request
          </Link>
          <Link
            href="/hospital/tracking/1"
            className={`flex items-center gap-2.5 px-3 py-2 rounded transition-colors ${pathname === '/hospital/tracking/1' ? 'bg-red-50 text-red-600' : 'text-gray-600 hover:bg-gray-100 hover:text-black'}`}
          >
            Request Tracking
          </Link>
          <Link
            href="/hospital/donors"
            className={`flex items-center gap-2.5 px-3 py-2 rounded transition-colors ${pathname === '/hospital/donors' ? 'bg-red-50 text-red-600' : 'text-gray-600 hover:bg-gray-100 hover:text-black'}`}
          >
            Registered Donors
          </Link>
        </nav>
        <div className="p-4 border-t border-gray-200">
          <div className="text-xs text-gray-500 mb-1">Signed in as</div>
          <div className="text-sm font-medium text-gray-800">
            Nawaloka Hospital
          </div>
          <Link
            href="/login"
            className="text-xs text-red-600 hover:underline mt-1 block"
          >
            Sign out
          </Link>
        </div>
      </aside>
      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  );
}
