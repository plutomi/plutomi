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
      }
    ];
  }
};

module.exports = nextConfig;
