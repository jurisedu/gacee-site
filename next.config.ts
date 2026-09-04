import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  images: { formats: ["image/avif", "image/webp"] },
  async rewrites() {
    return [
      { source: "/internal/brand-guidelines", destination: "/internal/brand-guidelines.html" },
      { source: "/internal/hanqiao-plan", destination: "/internal/hanqiao-plan.html" },
    ];
  },
  async redirects() {
    return [
      { source: "/:path*", has: [{ type: "host", value: "www.gacee.org" }], destination: "https://gacee.org/:path*", permanent: true },
    ];
  },
  async headers() {
    return [
      {
        source: "/internal/:path*",
        headers: [
          { key: "X-Robots-Tag", value: "noindex, nofollow, noarchive" },
          { key: "Cache-Control", value: "private, no-cache" },
        ],
      },
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
        ],
      },
    ];
  },
};

export default nextConfig;
