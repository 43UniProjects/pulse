import Link from 'next/link';

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col app-bg">
      <nav className="bg-white border-b border-gray-200 px-6 h-14 flex items-center justify-between">
        <Link
          href="/"
          className="font-display font-bold text-xl tracking-tight text-black"
        >
          Pulse
        </Link>
        <div className="flex items-center gap-6 text-sm font-medium text-gray-600">
          <Link href="/" className="hover:text-black transition-colors">
            Home
          </Link>
          <Link href="/login" className="hover:text-black transition-colors">
            Login
          </Link>
          <Link
            href="/register"
            className="bg-black text-white px-4 py-1.5 rounded hover:bg-gray-800 transition-colors shadow-sm hover:shadow-md"
          >
            Register
          </Link>
        </div>
      </nav>
      <main className="flex-1">{children}</main>
    </div>
  );
}
