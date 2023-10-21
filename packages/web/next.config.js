/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "githubusercontent.com",
      },
    ],
  },
  async rewrites() {
    return [
      {
        source: "/api/(.*)",
        // Show a custom page when a user navigates to the API route for NextJS
        destination: "/api-fallback",
      },
    ];
  },
};

module.exports = nextConfig;
