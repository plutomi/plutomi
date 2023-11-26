const withMDX = require("@next/mdx")();
/** @type {import('next').NextConfig} */

const nextConfig = {
  reactStrictMode: true,
  pageExtensions: ["js", "jsx", "mdx", "ts", "tsx", "md"],

  output: "standalone",
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "githubusercontent.com"
      }
    ]
  }
};

module.exports = withMDX(nextConfig);
