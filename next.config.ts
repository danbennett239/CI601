import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: ["ci601-dental-practice-images.s3.eu-north-1.amazonaws.com"],
  },
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
