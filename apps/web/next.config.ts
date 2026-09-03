import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    externalDir: true,
  },
  transpilePackages: [
    "@readify/contracts",
    "@readify/modules",
    "@readify/platform",
  ],
};

export default nextConfig;
