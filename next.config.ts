import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    // Desabilita cache persistente do Turbopack (evita erro em drives externos)
    turbopackFileSystemCacheForDev: false,
  },
};

export default nextConfig;
