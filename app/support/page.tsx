import { Metadata } from 'next';
import Link from 'next/link';
import { Suspense } from 'react';
import {
  User,
  Building2,
  Activity,
  ShieldCheck,
  ArrowRight,
  Loader2,
} from 'lucide-react';

import Footer from '@/components/footer';
import Header from '@/components/header/main';
import { getFaqs } from './data';
import FaqClient from './faq-client';

export const metadata: Metadata = {
  title: 'Support & FAQs',
  description:
    'Help Center and Frequently Asked Questions for the Pulse network.',
};

// Data wrapper component for Suspense
async function FaqSection() {
  const faqs = await getFaqs();
  return <FaqClient initialFaqs={faqs} />;
}

export default function SupportPage() {
  return (
    <>
      <Header />
      <div className="w-full flex-1 flex flex-col">
        {/* Compact Header Section */}
        <section className="border-b border-border bg-card/20 py-12">
          <div className="max-w-7xl mx-auto px-6">
            <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-foreground mb-2">
              Help Center
            </h1>
            <p className="text-lg text-muted-foreground">
              Find answers instantly or get in touch with our team.
            </p>
          </div>
        </section>

        {/* Two-Column Main Content */}
        <section className="py-12 max-w-7xl mx-auto px-6 w-full">
          <div className="grid lg:grid-cols-12 gap-12 items-start">
            {/* Left Column: Search & FAQs (Immediately Visible) */}
            <div className="lg:col-span-8 w-full">
              <Suspense
                fallback={
                  <div className="flex justify-center items-center p-12 bg-card border border-border rounded-lg">
                    <Loader2 className="w-6 h-6 text-primary animate-spin" />
                  </div>
                }
              >
                <FaqSection />
              </Suspense>
            </div>

            {/* Right Column: Categories & Contact CTA (Sticky Sidebar) */}
            <div className="lg:col-span-4 w-full space-y-6 sticky top-24">
              <h3 className="font-semibold text-lg text-foreground mb-4">
                Quick Guides
              </h3>

              <div className="grid gap-3">
                <div className="flex items-start gap-4 p-4 rounded-lg border border-border bg-card hover:border-foreground/30 transition-colors">
                  <User className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-sm text-foreground">
                      Donor Guides
                    </h4>
                    <p className="text-xs text-muted-foreground mt-1">
                      Account setup, eligibility, and protocols.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-4 rounded-lg border border-border bg-card hover:border-foreground/30 transition-colors">
                  <Building2 className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-sm text-foreground">
                      Hospital Access
                    </h4>
                    <p className="text-xs text-muted-foreground mt-1">
                      Emergency broadcasting and dashboard usage.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-4 rounded-lg border border-border bg-card hover:border-foreground/30 transition-colors">
                  <Activity className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-sm text-foreground">
                      System Status
                    </h4>
                    <p className="text-xs text-muted-foreground mt-1">
                      WebSocket connectivity and grid availability.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-4 rounded-lg border border-border bg-card hover:border-foreground/30 transition-colors">
                  <ShieldCheck className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-sm text-foreground">
                      Trust & Safety
                    </h4>
                    <p className="text-xs text-muted-foreground mt-1">
                      Data privacy, credential verification, and security.
                    </p>
                  </div>
                </div>
              </div>

              {/* Contact CTA */}
              <div className="mt-8 p-6 rounded-lg bg-secondary border border-border text-center">
                <h3 className="font-semibold text-foreground mb-2">
                  Still need help?
                </h3>
                <p className="text-sm text-muted-foreground mb-6">
                  Our support team is available 24/7 for critical network
                  issues.
                </p>
                <Link
                  href="/contact"
                  className="inline-flex items-center justify-center w-full h-10 px-5 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
                >
                  Contact Support
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </div>
            </div>
          </div>
        </section>
      </div>
      <Footer />
    </>
  );
}
