import { Metadata } from 'next';
import { Suspense } from 'react';
import { headers } from 'next/headers';
import { Phone, Mail, MapPin, Clock } from 'lucide-react';

import Footer from '@/components/footer';
import Header from '@/components/header/main';
import GenericFallback from '@/components/fallback';
import ContactForm from '@/app/contact/contact-form';
import { auth } from '@/lib/auth/config';

export const metadata: Metadata = {
  title: 'Contact 24/7',
  description:
    'Get in touch with the Pulse emergency blood network team. 24/7 support for hospitals, donors, and system integration.',
};

async function ContactFormWrapper() {
  // Retrieve the session securely using Better Auth
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  // Map the Better Auth session directly to the form's expected props
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
        {/* Compact Header Banner Section */}
        <section className="border-b border-border bg-card/20 py-12">
          <div className="max-w-7xl mx-auto px-6">
            <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-foreground mb-2">
              Contact 24/7
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl">
              Whether you are a hospital facing a critical shortage or a donor
              needing account support, our team is always on standby.
            </p>
          </div>
        </section>

        {/* Two-Column Main Content Section */}
        <section className="py-12 max-w-7xl mx-auto px-6 w-full">
          <div className="grid lg:grid-cols-12 gap-12 items-start">
            {/* Left Column: Rigid Contact Channel Cards */}
            <div className="lg:col-span-5 w-full space-y-5">
              {/* Emergency Hotline Card */}
              <div className="bg-card border border-border rounded-xl p-5 shadow-sm flex items-start gap-4">
                <div className="w-10 h-10 rounded-md bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                  <Phone className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground text-sm mb-1">
                    Emergency Hotline
                  </h3>
                  <p className="text-xs text-muted-foreground mb-2">
                    For hospitals requiring immediate dispatch override.
                  </p>
                  <p className="text-primary font-mono font-medium text-sm">
                    +94 11 234 5678
                  </p>
                </div>
              </div>

              {/* Technical Support Card */}
              <div className="bg-card border border-border rounded-xl p-5 shadow-sm flex items-start gap-4">
                <div className="w-10 h-10 rounded-md bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                  <Mail className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground text-sm mb-1">
                    Technical Support
                  </h3>
                  <p className="text-xs text-muted-foreground mb-2">
                    For system integration, API keys, and account issues.
                  </p>
                  <p className="text-foreground font-medium text-sm">
                    support@pulsenetwork.lk
                  </p>
                </div>
              </div>

              {/* Headquarters Card */}
              <div className="bg-card border border-border rounded-xl p-5 shadow-sm flex items-start gap-4">
                <div className="w-10 h-10 rounded-md bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                  <MapPin className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground text-sm mb-1">
                    Headquarters
                  </h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Pulse Medical Grid HQ
                    <br />
                    150 Ward Place, Colombo 07
                    <br />
                    Sri Lanka
                  </p>
                </div>
              </div>

              {/* SLA Response Guarantee Card */}
              <div className="bg-card border border-border rounded-xl p-5 shadow-sm flex items-start gap-4">
                <div className="w-10 h-10 rounded-md bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                  <Clock className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground text-sm mb-1">
                    Guaranteed Response SLA
                  </h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Hospital emergency tickets are routed directly to our Tier 1
                    operations desk with a guaranteed 3-minute response SLA.
                    Donor inquiries are processed within 24 hours.
                  </p>
                </div>
              </div>
            </div>

            {/* Right Column: Contact Form */}
            <div className="lg:col-span-7 w-full">
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
