import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // node:sqlite is a built-in module; keep it external so the bundler
  // doesn't try to pull it into the client/edge bundles.
  serverExternalPackages: ["node:sqlite"],
  // Hide the dev-mode overlay so the /report page screenshots cleanly.
  devIndicators: false,
};

export default nextConfig;
