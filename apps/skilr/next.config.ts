import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@ayz/firebase", "@ayz/paystack", "@ayz/types"],
};

export default nextConfig;
