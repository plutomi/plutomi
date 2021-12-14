module.exports = {
  reactStrictMode: true,
  env: {
    NEXT_PUBLIC_DOMAIN_NAME: process.env.DOMAIN_NAME,
    NEXT_PUBLIC_API_DOMAIN_NAME: process.env.API_DOMAIN_NAME,
    DYNAMO_TABLE_NAME: process.env.DYNAMO_TABLE_NAME, // Name of your Dynamo table
    NEXT_PUBLIC_GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID, // Client ID for sign in with google
    IRON_SESSION_COOKIE_NAME: process.env.IRON_SESSION_COOKIE_NAME, // Name of cookie for auth
    IRON_SESSION_PASSWORD_1: process.env.IRON_SESSION_PASSWORD_1, // Password #1 for encrypting auth cookie
    IRON_SEAL_PASSWORD: process.env.IRON_SEAL_PASSWORD,
  },
};
