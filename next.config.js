module.exports = {
  reactStrictMode: true,
  env: {
    NEXT_PUBLIC_WEBSITE_URL: process.env.WEBSITE_URL || `http://localhost:3000`, // The url of your website ie `https://plutomi.com`
    DYNAMO_TABLE_NAME: process.env.DYNAMO_TABLE_NAME, // Name of your Dynamo table
    NEXT_PUBLIC_GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID, // Client ID for sign in with google
    NEXT_IRON_SESSION_COOKIE_NAME: process.env.NEXT_IRON_SESSION_COOKIE_NAME, // Name of cookie for auth
    NEXT_IRON_SESSION_PASSWORD_1: process.env.NEXT_IRON_SESSION_PASSWORD_1, // Password #1 for encrypting auth cookie
  },

  // async redirects() {
  //   return [
  //     {
  //       source: "/openings/:any*",
  //       destination: "/",
  //       permanent: false,
  //     },
  //     {
  //       source: "/stages/:any*",
  //       destination: "/",
  //       permanent: false,
  //     },
  //     {
  //       source: "/profile/:any*",
  //       destination: "/",
  //       permanent: false,
  //     },
  //     {
  //       source: "/team/:any*",
  //       destination: "/",
  //       permanent: false,
  //     },
  //     {
  //       source: "/domains/:any*",
  //       destination: "/",
  //       permanent: false,
  //     },
  //     {
  //       source: "/dashboard/:any*",
  //       destination: "/",
  //       permanent: false,
  //     },
  //   ];
  // },
};
