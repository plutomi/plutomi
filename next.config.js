module.exports = {
  reactStrictMode: true,
  env: {
    NEXT_PUBLIC_DOMAIN_NAME: process.env.DOMAIN_NAME,
    NEXT_PUBLIC_API_DOMAIN_NAME: process.env.API_DOMAIN_NAME,
    NEXT_PUBLIC_WEBSITE_URL: process.env.WEBSITE_URL,
    NEXT_PUBLIC_API_URL: process.env.API_URL,
    NEXT_PUBLIC_GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
  },
};
