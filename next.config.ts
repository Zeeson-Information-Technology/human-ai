import type { NextConfig } from "next";

// Ensure Turbopack resolves from this app directory (not the parent repo root)
const nextConfig: NextConfig & { turbopack?: { root?: string }; eslint?: { ignoreDuringBuilds?: boolean } } = {
  turbopack: {
    root: __dirname,
  },
  // Unblock production builds while we type-fix incrementally
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
