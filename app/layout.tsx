import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import type { ReactNode } from 'react';
import { ThemeProvider } from 'next-themes';
import { Toaster } from 'sonner';
import './globals.css';
const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: {
    template: '%s | Pulse',
    default: 'Pulse - Centralized Blood Donor Network',
  },
  description:
    'Real-time emergency blood donation network connecting hospitals with verified local donors.',
  icons: {
    icon: '/logo/favicon.ico',
    shortcut: '/logo/favicon.ico',
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-screen bg-background text-foreground flex flex-col font-sans selection:bg-primary/30 selection:text-primary-foreground">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <main className="flex-1 flex flex-col">{children}</main>
          <Toaster
            richColors
            position="top-right"
            offset="120px"
            style={{ right: '15px' }}
            duration={3000}
          />
        </ThemeProvider>
      </body>
    </html>
  );
}
