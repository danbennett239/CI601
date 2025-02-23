import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: "/", // When visiting "/"
        destination: "/home", // Redirect to "/home"
        permanent: true, // 301 Redirect (permanent)
      },
    ];
  },
};

export default nextConfig;
