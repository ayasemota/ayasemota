import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@ayasemota/firebase", "@ayasemota/paystack"],
};

export default nextConfig;
