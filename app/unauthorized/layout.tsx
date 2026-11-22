import type { Metadata } from 'next';
import type { ReactNode } from 'react';

export const metadata: Metadata = {
  title: 'Access Denied',
  description: 'You do not have permission to view this page.',
};

export default function UnauthorizedLayout({
  children,
}: {
  children: ReactNode;
}) {
  return children;
}
