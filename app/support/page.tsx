import Link from 'next/link';
import {
  Search,
  User,
  Building2,
  Activity,
  ShieldCheck,
  ArrowRight,
} from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function SupportPage() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans">
      <Header />

      <main className="flex-1">
        {/* Header Section */}
        <section className="border-b border-border bg-card/20 py-16 lg:py-24">
          <div className="max-w-4xl mx-auto px-6 text-center">
            <h1 className="text-4xl sm:text-5xl font-semibold tracking-tight text-foreground mb-4">
              Help Center
            </h1>
            <p className="text-lg text-muted-foreground mb-8">
              How can we assist you with the Pulse network today?
            </p>

            {/* Search Bar Mockup */}
            <div className="relative max-w-xl mx-auto">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search for articles, guides, or FAQs..."
                className="w-full h-12 pl-11 pr-4 rounded-md border border-border bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-primary transition-all shadow-sm"
              />
            </div>
          </div>
        </section>

        {/* Category Grid */}
        <section className="py-16 max-w-7xl mx-auto px-6 border-b border-border">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-6 rounded-lg border border-border bg-card hover:border-foreground/30 transition-colors">
              <User className="w-6 h-6 text-primary mb-4" />
              <h3 className="font-semibold text-foreground mb-2">
                Donor Guides
              </h3>
              <p className="text-sm text-muted-foreground">
                Account setup, eligibility rules, and donation protocols.
              </p>
            </div>
            <div className="p-6 rounded-lg border border-border bg-card hover:border-foreground/30 transition-colors">
              <Building2 className="w-6 h-6 text-primary mb-4" />
              <h3 className="font-semibold text-foreground mb-2">
                Hospital Access
              </h3>
              <p className="text-sm text-muted-foreground">
                Emergency broadcasting, dashboard usage, and APIs.
              </p>
            </div>
            <div className="p-6 rounded-lg border border-border bg-card hover:border-foreground/30 transition-colors">
              <Activity className="w-6 h-6 text-primary mb-4" />
              <h3 className="font-semibold text-foreground mb-2">
                System Status
              </h3>
              <p className="text-sm text-muted-foreground">
                WebSocket connectivity and regional grid availability.
              </p>
            </div>
            <div className="p-6 rounded-lg border border-border bg-card hover:border-foreground/30 transition-colors">
              <ShieldCheck className="w-6 h-6 text-primary mb-4" />
              <h3 className="font-semibold text-foreground mb-2">
                Trust & Safety
              </h3>
              <p className="text-sm text-muted-foreground">
                Data privacy, credential verification, and security.
              </p>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-20 max-w-4xl mx-auto px-6">
          <h2 className="text-2xl font-semibold tracking-tight text-foreground mb-8">
            Frequently Asked Questions
          </h2>
          <div className="space-y-4">
            <div className="p-6 rounded-lg border border-border bg-card">
              <h4 className="font-medium text-foreground mb-2">
                How does the 4-month eligibility rule work?
              </h4>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Our system strictly enforces a 4-month waiting period between
                donations for your health and safety. The rule engine
                automatically temporarily suspends your account from receiving
                emergency broadcasts until this period safely elapses.
              </p>
            </div>
            <div className="p-6 rounded-lg border border-border bg-card">
              <h4 className="font-medium text-foreground mb-2">
                What happens if I miss a WebSocket emergency alert?
              </h4>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Emergency broadcasts are sent to multiple eligible donors in the
                optimal 5&ndash;20km radius. If you miss an alert, the system
                automatically cascades the request to the next nearest available
                donor to ensure the hospital&apos;s needs are met instantly.
              </p>
            </div>
            <div className="p-6 rounded-lg border border-border bg-card">
              <h4 className="font-medium text-foreground mb-2">
                How do hospitals verify my identity?
              </h4>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Upon accepting a request, you will receive a secure QR
                credential on your dashboard. Present this at the hospital
                reception for instant verification against their system.
              </p>
            </div>
          </div>

          <div className="mt-12 p-8 rounded-lg bg-secondary border border-border text-center">
            <h3 className="font-semibold text-foreground mb-2">
              Still need help?
            </h3>
            <p className="text-sm text-muted-foreground mb-6">
              Our support team is available 24/7 for critical network issues.
            </p>
            <Link
              href="/contact"
              className="inline-flex items-center justify-center h-10 px-5 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
            >
              Contact Support
              <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
