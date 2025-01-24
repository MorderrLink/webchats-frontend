import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      {
        hostname: "img.clerk.com",
      },
      {
        hostname: "images.clerk.dev",
      }, {
        hostname: "dashboard.clerk.com"
      }
    ]
  },
  env: {
    NEXT_PUBLIC_VAPID_KEY: process.env.publicVapidKey
  }
};

export default nextConfig;
