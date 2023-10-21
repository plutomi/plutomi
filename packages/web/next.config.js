/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  async rewrites() {
    return [
      {
        source: "/api(.*)",
        destination: "/this-is-not-the-api-url-you-are-looking-for",
      },
    ];
  },
};

module.exports = nextConfig;
