import { Metadata } from 'next';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import LoginForm from '@/components/auth/LoginForm';

export const metadata: Metadata = {
  title: 'Authentication',
  description: 'Login to the Pulse Emergency Blood Network',
};

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans">
      <Header />

      <main className="flex-1 flex items-center justify-center p-6 relative">
        {/* Subtle grid background for the clinical telemetry feel */}
        <div className="absolute inset-0 z-0 bg-[linear-gradient(to_right,var(--color-border)_1px,transparent_1px),linear-gradient(to_bottom,var(--color-border)_1px,transparent_1px)] bg-[size:3rem_3rem] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_50%,#000_20%,transparent_100%)] opacity-20 pointer-events-none" />

        <div className="relative z-10 w-full flex justify-center">
          <LoginForm />
        </div>
      </main>

      <Footer />
    </div>
  );
}
