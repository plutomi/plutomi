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
    // The load balancer will redirect these to the FE, and Next will force the redirect to the docs page
    return ["/api", "/api/", "/api/docs", "/api/docs/"].map((source) => ({
      source,
      destination: "/docs/api",
      permanent: true
    }));
  }
};

module.exports = nextConfig;
