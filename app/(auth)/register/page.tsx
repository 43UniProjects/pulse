import { Metadata } from 'next';
import { Suspense } from 'react';
import RegisterForm from './register-form';

export const metadata: Metadata = {
  title: 'Register',
  description: 'Join the Pulse Emergency Blood Network as a donor or hospital.',
};

export default function RegisterPage() {
  return (
    <main className="flex-1 flex items-center justify-center p-6 py-12 relative w-full">
      {/* Telemetry Grid Background */}
      <div className="absolute inset-0 z-0 bg-[linear-gradient(to_right,var(--color-border)_1px,transparent_1px),linear-gradient(to_bottom,var(--color-border)_1px,transparent_1px)] bg-size-[3rem_3rem] mask-[radial-gradient(ellipse_60%_70%_at_50%_50%,#000_20%,transparent_100%)] opacity-20 pointer-events-none" />

      <div className="relative z-10 w-full flex justify-center">
        {/* Wrap the form in Suspense to handle useSearchParams statically */}
        <Suspense
          fallback={
            <div className="w-full max-w-lg h-150 bg-card border border-border rounded-xl animate-pulse shadow-sm" />
          }
        >
          <RegisterForm />
        </Suspense>
      </div>
    </main>
  );
}
