/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    // ! TODO: Separate client and server env files into their own thing
    // https://github.com/vercel/next.js/issues/13045
    externalDir: true
  }
};

module.exports = nextConfig;
