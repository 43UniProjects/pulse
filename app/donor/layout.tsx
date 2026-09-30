'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function DonorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  return (
    <div className="min-h-screen flex app-bg">
      <aside className="w-56 bg-white border-r border-gray-200 flex flex-col shrink-0">
        <div className="h-14 flex items-center px-5 border-b border-gray-200">
          <Link
            href="/"
            className="font-display font-bold text-lg tracking-tight text-black"
          >
            Pulse
          </Link>
        </div>
        <nav className="flex-1 p-3 flex flex-col gap-0.5 text-sm font-medium">
          <Link
            href="/donor/dashboard"
            className={`flex items-center gap-2.5 px-3 py-2 rounded transition-colors ${pathname === '/donor/dashboard' ? 'bg-red-50 text-red-600' : 'text-gray-600 hover:bg-gray-100 hover:text-black'}`}
          >
            Dashboard
          </Link>
          <Link
            href="/donor/profile"
            className={`flex items-center gap-2.5 px-3 py-2 rounded transition-colors ${pathname === '/donor/profile' ? 'bg-red-50 text-red-600' : 'text-gray-600 hover:bg-gray-100 hover:text-black'}`}
          >
            My Profile
          </Link>
        </nav>
        <div className="p-4 border-t border-gray-200">
          <div className="text-xs text-gray-500 mb-1">Signed in as</div>
          <div className="text-sm font-medium text-gray-800">Kamal Perera</div>
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
