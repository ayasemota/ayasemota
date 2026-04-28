import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@ayz/firebase", "@ayz/types"],
};

export default nextConfig;
