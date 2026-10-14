import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // This app is entirely dynamic (every page depends on the auth cookie),
  // so Next's experimental Cache Components / PPR features add friction
  // without benefit here — disabled to keep dev/build output simple.
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
