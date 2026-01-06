import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  serverExternalPackages: [],
  devIndicators: {
    appIsrStatus: false,
  },
  experimental: {
    // @ts-ignore
    allowedDevOrigins: ["localhost:3000", "192.168.1.20:3000"]
  }
};

export default nextConfig;
