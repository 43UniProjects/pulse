import { Suspense } from 'react';
import { Phone, Mail, MapPin, Clock } from 'lucide-react';
import { getServerSession } from 'next-auth';

import Footer from '@/components/Footer';
import Header from '@/components/header/main';
import GenericFallback from '@/components/fallback';
import ContactForm from './contact-form';
import { USER_ROLE, UserEntity } from '@/types/user.type';

async function ContactFormWrapper() {
  const session = await getServerSession();

  // Safely extract the role from the session, fallback to 'guest'
  const userRole = session?.user
    ? (session.user as UserEntity).role
    : USER_ROLE[3]; // 'guest'

  return <ContactForm userRole={userRole} />;
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
            {/* Contact Information */}
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

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-md bg-card border border-border flex items-center justify-center shrink-0">
                  <Mail className="w-5 h-5 text-foreground" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-1">
                    Technical Support
                  </h3>
                  <p className="text-sm text-muted-foreground mb-2">
                    For system integration, API keys, and account issues.
                  </p>
                  <p className="text-foreground font-medium">
                    support@pulsenetwork.lk
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-md bg-card border border-border flex items-center justify-center shrink-0">
                  <MapPin className="w-5 h-5 text-foreground" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-1">
                    Headquarters
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Pulse Medical Grid HQ
                    <br />
                    150 Ward Place
                    <br />
                    Colombo 07, Sri Lanka
                  </p>
                </div>
              </div>

              <div className="p-6 rounded-lg bg-secondary border border-border mt-8 flex items-start gap-4">
                <Clock className="w-5 h-5 text-muted-foreground shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-medium text-foreground text-sm mb-1">
                    Response Times
                  </h4>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Hospital emergency tickets are routed directly to our Tier 1
                    operations desk with a guaranteed 3-minute response SLA.
                    Donor inquiries are processed within 24 hours.
                  </p>
                </div>
              </div>
            </div>

            {/* Contact Form with Suspense Boundary */}
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
