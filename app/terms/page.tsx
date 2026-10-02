import Footer from '@/components/Footer';
import Header from '@/components/Header';

export default function TermsPage() {
  return (
    <>
      <Header />
      <div className="min-h-screen pt-24 pb-16 px-6 max-w-4xl mx-auto">
        <div className="space-y-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Terms of Service
            </h1>
            <p className="mt-4 text-muted-foreground">
              Last updated: October 1, 2026
            </p>
          </div>

          <div className="prose prose-sm sm:prose-base dark:prose-invert">
            <p>
              Welcome to Pulse. By accessing or using our real-time emergency
              blood network, you agree to be bound by these Terms of Service and
              our Privacy Policy.
            </p>

            <h2 className="text-xl font-semibold mt-8 mb-4">
              1. Use of Service
            </h2>
            <p>
              Pulse provides a platform to connect blood donors with individuals
              and hospitals in need of emergency blood supplies. You agree to
              use this service only for lawful purposes and in a manner that
              does not infringe upon the rights of others.
            </p>

            <h2 className="text-xl font-semibold mt-8 mb-4">
              2. User Accounts
            </h2>
            <p>
              When you create an account with us, you must provide accurate,
              complete, and current information at all times. Failure to do so
              constitutes a breach of the Terms, which may result in immediate
              termination of your account on our Service.
            </p>

            <h2 className="text-xl font-semibold mt-8 mb-4">
              3. Medical Disclaimer
            </h2>
            <p>
              Pulse is a facilitator of connections and does not provide medical
              advice, diagnosis, or treatment. All blood donations are subject
              to the strict medical screening protocols of the recipient
              hospitals or blood banks. Pulse is not liable for any medical
              complications arising from donations facilitated through our
              platform.
            </p>

            <h2 className="text-xl font-semibold mt-8 mb-4">
              4. Limitation of Liability
            </h2>
            <p>
              In no event shall Pulse, nor its directors, employees, partners,
              agents, suppliers, or affiliates, be liable for any indirect,
              incidental, special, consequential or punitive damages, including
              without limitation, loss of profits, data, use, goodwill, or other
              intangible losses, resulting from your access to or use of or
              inability to access or use the Service.
            </p>

            <h2 className="text-xl font-semibold mt-8 mb-4">
              5. Changes to Terms
            </h2>
            <p>
              We reserve the right, at our sole discretion, to modify or replace
              these Terms at any time. What constitutes a material change will
              be determined at our sole discretion.
            </p>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
