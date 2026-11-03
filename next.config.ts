import type { NextConfig } from "next";
import path from "node:path";

// Vercel runs genuine Next.js. The Cloudflare build continues to use vite.config.ts.
// Keep the Workers binding import intact in source, and map it only on Vercel's
// server-side webpack build to a private Node.js adapter.
const nextConfig: NextConfig = {
  ...(process.env.VERCEL ? { env: { NEXT_PUBLIC_BAM_VERCEL: "1" } } : {}),
  webpack(config, { isServer }) {
    if (isServer && process.env.VERCEL) {
      config.resolve.alias = {
        ...config.resolve.alias,
        "estate-platform": path.resolve(process.cwd(), "lib/vercel-cloudflare-env.ts"),
      };
    }
    return config;
  },
};

export default nextConfig;
