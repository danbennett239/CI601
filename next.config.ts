import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  basePath: "/home", // Sets the base URL to /home
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
