/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  async rewrites() {
    return [
      {
        source: "/api/(.*)",
        destination: "/api-fallback",
      },
    ];
  },
};

module.exports = nextConfig;
