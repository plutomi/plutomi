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
      {
        source: "/api/:path*",
        destination: "http://staging-plutomi-api.internal:8080"
      }
    ];
  }
};

module.exports = nextConfig;
