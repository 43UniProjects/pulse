import { Suspense } from 'react';
import { headers } from 'next/headers';

import { Phone } from 'lucide-react';
import Footer from '@/components/footer';
import Header from '@/components/header/main';
import GenericFallback from '@/components/fallback';
import ContactForm from './contact-form';
import { auth } from '@/lib/auth/config';

async function ContactFormWrapper() {
  // Retrieve the session securely using Better Auth
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  // Map the Better Auth session directly to the form's expected props,
  // bypassing the need for a separate database lookup.
  const userData = session?.user
    ? {
        _id: session.user.id,
        name: session.user.name || '',
        email: session.user.email,
        role: session.user.role as string,
      }
    : { _id: null, name: '', email: '', role: 'guest' };

  return <ContactForm user={userData} />;
}

export default function ContactPage() {
  return (
    <>
      <Header />
      <div className="flex-1 w-full flex flex-col">
        <section className="py-16 lg:py-24 max-w-7xl mx-auto px-6">
          <div className="mb-12">
            <h1 className="text-4xl sm:text-5xl font-semibold tracking-tight text-foreground mb-4">
              Contact 24/7
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl">
              Whether you are a hospital facing a critical shortage or a donor
              needing account support, our team is always on standby.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 lg:gap-24">
            {/* ... (The contact info UI remains exactly the same) ... */}
            <div className="space-y-8">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-md bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                  <Phone className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-1">
                    Emergency Hotline
                  </h3>
                  <p className="text-sm text-muted-foreground mb-2">
                    For hospitals requiring immediate dispatch override.
                  </p>
                  <p className="text-primary font-mono font-medium">
                    +94 11 234 5678
                  </p>
                </div>
              </div>

              {/* ... other contact methods ... */}
            </div>

            <div className="w-full">
              <Suspense fallback={<GenericFallback />}>
                <ContactFormWrapper />
              </Suspense>
            </div>
          </div>
        </section>
      </div>
      <Footer />
    </>
  );
}
