import { Phone, Mail, MapPin, Clock } from 'lucide-react';

import Footer from '@/components/footer';
import Header from '@/components/header/main';

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

            {/* Contact Form */}
            <div className="bg-card border border-border rounded-xl p-6 sm:p-8 shadow-sm">
              <h2 className="text-xl font-semibold text-foreground mb-6">
                Send a Message
              </h2>
              <form className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label
                      htmlFor="firstName"
                      className="text-sm font-medium text-foreground"
                    >
                      First Name
                    </label>
                    <input
                      id="firstName"
                      type="text"
                      className="w-full h-10 px-3 rounded-md border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-primary transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label
                      htmlFor="lastName"
                      className="text-sm font-medium text-foreground"
                    >
                      Last Name
                    </label>
                    <input
                      id="lastName"
                      type="text"
                      className="w-full h-10 px-3 rounded-md border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-primary transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label
                    htmlFor="email"
                    className="text-sm font-medium text-foreground"
                  >
                    Email Address
                  </label>
                  <input
                    id="email"
                    type="email"
                    className="w-full h-10 px-3 rounded-md border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-primary transition-all"
                  />
                </div>

                <div className="space-y-2">
                  <label
                    htmlFor="subject"
                    className="text-sm font-medium text-foreground"
                  >
                    Subject
                  </label>
                  <select
                    id="subject"
                    className="w-full h-10 px-3 rounded-md border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-primary transition-all appearance-none"
                  >
                    <option>General Inquiry</option>
                    <option>Hospital API Integration</option>
                    <option>Donor Account Issue</option>
                    <option>Report a Bug</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label
                    htmlFor="message"
                    className="text-sm font-medium text-foreground"
                  >
                    Message
                  </label>
                  <textarea
                    id="message"
                    rows={4}
                    className="w-full p-3 rounded-md border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-primary transition-all resize-none"
                  ></textarea>
                </div>

                <button
                  type="button"
                  className="w-full h-10 mt-2 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background"
                >
                  Send Message
                </button>
              </form>
            </div>
          </div>
        </section>
      </div>
      <Footer />
    </>
  );
}
