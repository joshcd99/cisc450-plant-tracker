import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Photo uploads go through Server Actions; bump the default 1MB body limit
  // to match the 5MB cap advertised in the upload form's hint.
  experimental: {
    serverActions: {
      bodySizeLimit: "6mb",
    },
  },
};

export default nextConfig;
