/** @type {import('next').NextConfig} */

const nextConfig = {
  reactStrictMode: true,
  output: "standalone",
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "githubusercontent.com"
      }
    ]
  },
  async rewrites() {
    return [
      // If you hit the base API route, go to docs

      {
        source: "/api",
        destination: `/apiDocs`
      },
      {
        source: "/api/",
        destination: `/apiDocs`
      }
    ];
  }
};

module.exports = nextConfig;
