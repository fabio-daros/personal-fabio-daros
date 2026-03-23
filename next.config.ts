import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["192.168.0.155"],
  experimental: {
    turbopackFileSystemCacheForDev: false,
  },
};

export default nextConfig;
