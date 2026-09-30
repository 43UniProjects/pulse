import { Metadata } from 'next';
export const metadata: Metadata = { title: 'Request Tracking' };
export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
