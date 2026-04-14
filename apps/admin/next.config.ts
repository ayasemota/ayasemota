import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@ayasemota/firebase", "@ayasemota/types"],
};

export default nextConfig;
