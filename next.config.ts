import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.mzstatic.com",
      },
      {
        protocol: "https",
        hostname: "coverartarchive.org",
      },
      {
        protocol: "http",
        hostname: "coverartarchive.org",
      },
      {
        protocol: "https",
        hostname: "**.archive.org",
      },
      {
        protocol: "https",
        hostname: "**.spotifycdn.com",
      },
      {
        protocol: "https",
        hostname: "i.scdn.co",
      },
      {
        protocol: "https",
        hostname: "**.dzcdn.net",
      },
    ],
  },
};

export default nextConfig;
