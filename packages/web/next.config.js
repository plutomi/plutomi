/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: "export",
  experimental: {
    // https://github.com/vercel/next.js/issues/13045
    externalDir: true
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "githubusercontent.com"
      }
    ]
  }
};

const withBundleAnalyzer = require("@next/bundle-analyzer")({
  // Set ANALYZE=true in web/package.json "build" command to analyze bundle size
  enabled: process.env.ANALYZE === "true"
});

module.exports = withBundleAnalyzer(nextConfig);
