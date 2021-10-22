const ironConfig = {
  password: [
    {
      id: 1,
      password: process.env.NEXT_IRON_SESSION_PASSWORD_1,
    },
  ],
  cookieName: process.env.NEXT_IRON_SESSION_COOKIE_NAME,
  // if your localhost is served on http:// then disable the secure flag
  cookieOptions: {
    secure: process.env.NODE_ENV === "production",
  },
};

export default ironConfig;
