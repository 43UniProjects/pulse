import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 1. React Compiler (Stable in Next.js 16)
  // Automatically optimizes components and eliminates unnecessary re-renders
  // without needing manual useMemo or useCallback hooks.
  reactCompiler: true,

  // 2. Intelligent Caching (Next.js 16 Performance Feature)
  // Replaces legacy partial prerendering (PPR) for aggressive static/dynamic hybrid delivery.
  cacheComponents: true,

  // 3. Image Optimization Security & Best Practices
  images: {
    formats: ["image/avif", "image/webp"], // Delivers highly compressed modern formats first
    remotePatterns: [
      {
        protocol: "https",
        hostname: "example.com", // Replace with your production asset CDN/domain
        port: "",
        pathname: "/**",
      },
    ],
  },

  // 4. Compiler & Bundler Performance
  experimental: {
    turbopackFileSystemCacheForDev: true,
    // Stores compiler artifacts on disk for blistering fast hot-module replacement (HMR)
    turbopackFileSystemCacheForBuild: true,

    // Automatically splits and re-orders CSS chunks to only load what the route requires
    cssChunking: true,

    // Prevents large third-party modular packages from ballooning build times
    optimizePackageImports: ["lucide-react", "@headlessui/react"],
  },

  // 5. Build Safety & Cleanliness
  poweredByHeader: false, // Security hardening: hides "X-Powered-By: Next.js" response headers

  output: "standalone",
};

export default nextConfig;
