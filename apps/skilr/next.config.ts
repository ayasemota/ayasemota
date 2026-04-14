import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@ayasemota/firebase", "@ayasemota/paystack", "@ayasemota/types"],
};

export default nextConfig;
