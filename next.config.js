require("dotenv").config();
import { get } from "env-var";

module.exports = {
  reactStrictMode: true,
  env: {
    NEXT_PUBLIC_WEBSITE_URL:
      get(WEBSITE_URL).asString() || `http://localhost:3000`, // The url of your website ie `https://plutomi.com`
    DYNAMO_TABLE_NAME: get(DYNAMO_TABLE_NAME).required().asString(), // Name of your Dynamo table
    NEXT_PUBLIC_GOOGLE_CLIENT_ID: get(GOOGLE_CLIENT_ID).required().asString(), // Client ID for sign in with google
    IRON_SESSION_COOKIE_NAME: get(IRON_SESSION_COOKIE_NAME)
      .required()
      .asString(), // Name of cookie for auth
    IRON_SESSION_PASSWORD_1: get(IRON_SESSION_PASSWORD_1).required().asString(), // Password #1 for encrypting auth cookie
    // you can set multiple but you have to add it to the sessionOptions variable
    IRON_SEAL_PASSWORD: get(IRON_SEAL_PASSWORD).required().asString(),
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
