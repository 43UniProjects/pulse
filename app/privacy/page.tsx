export default function PrivacyPage() {
  return (
    <div className="min-h-screen pt-24 pb-16 px-6 max-w-4xl mx-auto">
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Privacy Policy
          </h1>
          <p className="mt-4 text-muted-foreground">
            Last updated: {new Date().toLocaleDateString()}
          </p>
        </div>

        <div className="prose prose-sm sm:prose-base dark:prose-invert">
          <p>
            At Pulse, we take your privacy seriously. This Privacy Policy
            explains how we collect, use, disclose, and safeguard your
            information when you visit our website and use our real-time
            emergency blood network.
          </p>

          <h2 className="text-xl font-semibold mt-8 mb-4">
            1. Information We Collect
          </h2>
          <p>
            We collect information that you voluntarily provide to us when you
            register on Pulse, express an interest in obtaining information
            about us or our products and services, or otherwise when you contact
            us. This may include your name, email address, blood type, and
            location data relevant to blood donation requests.
          </p>

          <h2 className="text-xl font-semibold mt-8 mb-4">
            2. How We Use Your Information
          </h2>
          <p>
            Having accurate information about you permits us to provide you with
            a smooth, efficient, and customized experience. Specifically, we may
            use information collected about you via the Site to:
          </p>
          <ul className="list-disc pl-5 space-y-2 mt-4">
            <li>Facilitate real-time emergency blood matching.</li>
            <li>Create and manage your account.</li>
            <li>Notify you of urgent blood requests in your vicinity.</li>
            <li>Respond to customer service requests.</li>
          </ul>

          <h2 className="text-xl font-semibold mt-8 mb-4">3. Data Security</h2>
          <p>
            We use administrative, technical, and physical security measures to
            help protect your personal information. While we have taken
            reasonable steps to secure the personal information you provide to
            us, please be aware that despite our efforts, no security measures
            are perfect or impenetrable, and no method of data transmission can
            be guaranteed against any interception or other type of misuse.
          </p>

          <h2 className="text-xl font-semibold mt-8 mb-4">4. Contact Us</h2>
          <p>
            If you have questions or comments about this Privacy Policy, please
            contact us through our Help Center.
          </p>
        </div>
      </div>
    </div>
  );
}
