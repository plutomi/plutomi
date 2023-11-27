/** @type {import('next').NextConfig} */

const nextConfig = {
  reactStrictMode: true,
  pageExtensions: ["js", "jsx", "mdx", "ts", "tsx"],
  output: "standalone",
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "githubusercontent.com"
      }
    ]
  },
  async redirects() {
    // ! TODO: Add redirect toast with query param
    return [
      {
        source: "/api",
        destination: "/docs/api",
        permanent: true
      },
      {
        source: "/api/",
        destination: "/docs/api",
        permanent: true
      },
      {
        // I assume this might be a common typo
        source: "/api/docs",
        destination: "/docs/api",
        permanent: true
      }
    ];
  }
};

module.exports = nextConfig;
