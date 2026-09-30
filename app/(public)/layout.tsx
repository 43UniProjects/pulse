import Link from 'next/link';

import { Header } from '@/components/Header';

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col app-bg">
      <Header />
      <main className="flex-1 flex flex-col">{children}</main>
    </div>
  );
}
