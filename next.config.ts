import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    formats: ["image/avif", "image/webp"],
    // Photos servies depuis /public et depuis Supabase Storage.
    remotePatterns: [
      {
        protocol: "https",
        hostname: "ogkcombomgmazwqvfeqk.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
};

export default nextConfig;
