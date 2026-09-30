import Link from 'next/link';

const features = [
  {
    title: 'Real-time Alerts',
    desc: 'Hospitals broadcast blood requests instantly. Eligible donors in the area are notified within seconds via push and SMS.',
  },
  {
    title: 'Location-based Matching',
    desc: 'Donors are ranked by proximity to the requesting hospital, maximizing speed and reducing logistics overhead.',
  },
  {
    title: 'Eligibility Verification',
    desc: 'Automated checks against donation history, health flags, and wait periods ensure only eligible donors receive alerts.',
  },
];

export default function Landing() {
  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="border-b border-gray-200 px-8 py-20">
        <div className="max-w-3xl mx-auto">
          <div className="inline-block bg-red-600 text-white text-xs font-semibold px-2.5 py-1 rounded mb-6 uppercase tracking-wider">
            Emergency Network
          </div>
          <h1 className="font-display font-bold text-5xl leading-tight text-black mb-5">
            Real-time blood donation,
            <br />
            where it&apos;s needed most.
          </h1>
          <p className="text-gray-500 text-lg mb-8 max-w-xl">
            Pulse connects hospitals with verified nearby donors the moment
            blood is needed — reducing response time from hours to minutes.
          </p>
          <div className="flex gap-3">
            <Link
              href="/register"
              className="bg-red-600 text-white font-medium px-5 py-2.5 rounded hover:bg-red-700 transition-colors text-sm shadow-sm hover:shadow-md"
            >
              Register as Donor
            </Link>
            <Link
              href="/register"
              className="border border-gray-300 text-gray-700 font-medium px-5 py-2.5 rounded hover:bg-gray-50 transition-colors text-sm shadow-sm hover:shadow-md"
            >
              Register as Hospital
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="px-8 py-16 border-b border-gray-200">
        <div className="max-w-3xl mx-auto">
          <h2 className="font-display font-semibold text-xs uppercase tracking-widest text-gray-400 mb-8">
            How it works
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {features.map((f, i) => (
              <div
                key={i}
                className="glass border rounded-xl p-5 shadow-sm transition-shadow hover:shadow-md"
              >
                <div className="text-red-600 font-display font-bold text-3xl leading-none mb-4">
                  0{i + 1}
                </div>
                <h3 className="font-display font-semibold text-base text-black mb-2">
                  {f.title}
                </h3>
                <p className="text-sm text-gray-500 leading-relaxed">
                  {f.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA strip */}
      <section className="px-8 py-12">
        <div className="max-w-3xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <div className="font-display font-semibold text-lg text-black">
              Ready to save lives?
            </div>
            <div className="text-sm text-gray-500">
              Join thousands of donors and hospitals already on Pulse.
            </div>
          </div>
          <div className="flex gap-3 shrink-0">
            <Link
              href="/register"
              className="bg-black text-white font-medium text-sm px-4 py-2 rounded hover:bg-gray-800 transition-colors shadow-sm hover:shadow-md"
            >
              Register as Donor
            </Link>
            <Link
              href="/register"
              className="bg-white text-black border border-gray-300 font-medium text-sm px-4 py-2 rounded hover:bg-gray-50 transition-colors shadow-sm hover:shadow-md"
            >
              Register as Hospital
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200 px-8 py-6">
        <div className="max-w-3xl mx-auto flex items-center justify-between text-xs text-gray-400">
          <span className="font-display font-bold text-black text-sm">
            Pulse
          </span>
          <span>© 2026 Pulse Emergency Network. All rights reserved.</span>
          <div className="flex gap-4">
            <a href="#" className="hover:text-gray-600 transition-colors">
              Privacy
            </a>
            <a href="#" className="hover:text-gray-600 transition-colors">
              Terms
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
