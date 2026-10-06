import { Metadata } from 'next';
import LoginForm from './login-form';
import Footer from '@/components/footer';
import Header from '@/components/header/main';

export const metadata: Metadata = {
  title: 'Login',
  description: 'Login to the Pulse Emergency Blood Network',
};

export default function LoginPage() {
  return (
    <>
      <Header />
      <main className="flex-1 flex items-center justify-center p-6 py-12 relative w-full">
        {/* Telemetry grid background */}
        <div className="absolute inset-0 z-0 bg-[linear-gradient(to_right,var(--color-border)_1px,transparent_1px),linear-gradient(to_bottom,var(--color-border)_1px,transparent_1px)] bg-[size:3rem_3rem] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_50%,#000_20%,transparent_100%)] opacity-20 pointer-events-none" />

        <div className="relative z-10 w-full flex justify-center">
          <LoginForm />
        </div>
      </main>
      <Footer />
    </>
  );
}
