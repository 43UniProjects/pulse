import Link from 'next/link';
import Image from 'next/image';
import { Zap, MapPin, ShieldCheck, ArrowRight, Activity } from 'lucide-react';

import Footer from '@/components/footer';
import Header from '@/components/header/main';

export default function HomePage() {
  return (
    <>
      <Header />
      {/* Hero Section */}
      <section className="relative overflow-hidden min-h-[calc(100vh-4rem)] flex items-center justify-center border-b border-border py-12">
        {/* Replaced hardcoded red-950 with primary/10 for theme adaptability */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent pointer-events-none" />

        <div className="max-w-7xl mx-auto px-6 relative z-10 w-full flex flex-col md:flex-row items-center justify-between gap-12 lg:gap-20">
          <div className="w-full md:w-3/5 lg:w-2/3 text-center md:text-left md:-mt-8 lg:-mt-12">
            {/* Emergency Network Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-semibold tracking-wide uppercase mb-6">
              <Zap className="w-5 h-5" />
              Emergency Blood Donation Network
            </div>

            {/* Mobile Animated Logo */}
            <div className="flex md:hidden justify-center -mb-2 relative z-0">
              <Image
                src="/brand/logo-with-radar.svg"
                alt="Pulse Animated Blood Drop"
                width={280}
                height={280}
                className="w-full max-w-60 h-auto object-contain drop-shadow-2xl opacity-90 animate-pulse duration-6000"
                priority
              />
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-semibold tracking-tight text-foreground leading-[1.1] mb-6">
              Real-time blood donation, <br className="hidden sm:inline" />
              <span className="text-transparent bg-clip-text bg-linear-to-r from-foreground via-foreground to-muted-foreground">
                where it&apos;s needed most.
              </span>
            </h1>

            <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto md:mx-0 leading-relaxed mb-10">
              Pulse connects hospitals with verified nearby donors the moment an
              emergency occurs—reducing response time from hours to minutes.
            </p>

            {/* Action Bar 01 */}
            <div className="flex flex-col sm:flex-row items-center justify-center md:justify-start gap-4">
              <Link
                href="/register?type=donor"
                className="w-full sm:w-auto inline-flex items-center justify-center h-11 px-6 rounded-md bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-all shadow-lg shadow-primary/20"
              >
                Register as Donor
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
              <Link
                href="/register?type=hospital"
                className="w-full sm:w-auto inline-flex items-center justify-center h-11 px-6 rounded-md bg-card border border-border text-foreground font-medium hover:bg-secondary hover:border-foreground/30 transition-all"
              >
                Register as Hospital
              </Link>
            </div>
          </div>

          {/* Desktop Animated Logo */}
          <div className="hidden md:flex w-full md:w-2/5 lg:w-5/12 items-center justify-center md:justify-end self-center">
            <Image
              src="/brand/logo-with-radar.svg"
              alt="Pulse Animated Blood Drop"
              width={600}
              height={600}
              className="w-full max-w-[320px] lg:max-w-120 h-auto object-contain drop-shadow-2xl opacity-90 animate-pulse duration-6000 scale-110 lg:scale-100 md:origin-right"
              priority
            />
          </div>
        </div>
      </section>

      {/* System Metrics */}
      <section className="border-b border-border bg-card/40 py-8">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          <div>
            <div className="text-2xl lg:text-3xl font-semibold font-tabular text-foreground">
              5&ndash;20 km
            </div>
            <div className="text-xs text-muted-foreground mt-1 uppercase tracking-wider">
              Smart Local Matching
            </div>
          </div>
          <div>
            <div className="text-2xl lg:text-3xl font-semibold font-tabular text-foreground">
              4 Months
            </div>
            <div className="text-xs text-muted-foreground mt-1 uppercase tracking-wider">
              Safe Donation Intervals
            </div>
          </div>
          <div>
            <div className="text-2xl lg:text-3xl font-semibold font-tabular text-foreground">
              &lt; 30s
            </div>
            <div className="text-xs text-muted-foreground mt-1 uppercase tracking-wider">
              Instant Notifications
            </div>
          </div>
          <div>
            <div className="text-2xl lg:text-3xl font-semibold font-tabular text-foreground">
              100%
            </div>
            <div className="text-xs text-muted-foreground mt-1 uppercase tracking-wider">
              Verified Hospitals
            </div>
          </div>
        </div>
      </section>

      {/* How it works section */}
      <section className="py-24 max-w-7xl mx-auto px-6">
        <div className="text-center max-w-xl mx-auto mb-16">
          <span className="text-s font-mono uppercase tracking-widest text-primary mb-2 block">
            A Simple Process
          </span>
          <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-foreground">
            How Pulse Operates
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Step 01 */}
          <div className="bg-card border border-border rounded-2xl shadow-md p-8 relative flex flex-col justify-between hover:border-primary/50 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
            <div>
              <div className="flex items-center justify-between mb-6">
                <span className="text-3xl font-bold font-tabular text-primary">
                  01
                </span>
                <div className="w-10 h-10 rounded-md bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                  <Activity className="w-5 h-5" />
                </div>
              </div>
              <h3 className="text-lg font-medium text-foreground mb-2">
                Instant Emergency Alerts
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Hospitals send out emergency blood requests the moment they need
                it. Eligible donors nearby receive immediate push notifications
                directly to their devices.
              </p>
            </div>
          </div>

          {/* Step 02 */}
          <div className="bg-card border border-border rounded-2xl shadow-md p-8 relative flex flex-col justify-between hover:border-primary/50 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
            <div>
              <div className="flex items-center justify-between mb-6">
                <span className="text-3xl font-bold font-tabular text-primary">
                  02
                </span>
                <div className="w-10 h-10 rounded-md bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                  <MapPin className="w-5 h-5" />
                </div>
              </div>
              <h3 className="text-lg font-medium text-foreground mb-2">
                Smart Location Matching
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Our smart system filters donors by their exact location,
                prioritizing those closest to the hospital to minimize critical
                transport delays and save precious time.
              </p>
            </div>
          </div>

          {/* Step 03 */}
          <div className="bg-card border border-border rounded-2xl shadow-md p-8 relative flex flex-col justify-between hover:border-primary/50 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
            <div>
              <div className="flex items-center justify-between mb-6">
                <span className="text-3xl font-bold font-tabular text-primary">
                  03
                </span>
                <div className="w-10 h-10 rounded-md bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                  <ShieldCheck className="w-5 h-5" />
                </div>
              </div>
              <h3 className="text-lg font-medium text-foreground mb-2">
                Safe & Verified Process
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                We automatically ensure that all donors are healthy and eligible
                to donate by enforcing standard waiting periods, keeping the
                entire process safe for everyone.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Action Bar 02 */}
      <section className="border-t border-border bg-card/20 py-20">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-foreground mb-4">
            Ready to save lives?
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground mb-8">
            Join verified donors and medical institutions already integrated
            onto the Pulse network.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/register?type=donor"
              className="inline-flex items-center justify-center h-10 px-5 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
            >
              Register as Donor
            </Link>
            <Link
              href="/register?type=hospital"
              className="inline-flex items-center justify-center h-10 px-5 rounded-md bg-card border border-border text-foreground text-sm font-medium hover:bg-secondary transition-colors"
            >
              Register as Hospital
            </Link>
          </div>
        </div>
      </section>
      <Footer />
    </>
  );
}
