import { Metadata } from 'next';
export const metadata: Metadata = { title: 'Post Request' };
export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
