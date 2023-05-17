/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    // https://github.com/vercel/next.js/issues/13045
    externalDir: true
  }
};

module.exports = nextConfig;
