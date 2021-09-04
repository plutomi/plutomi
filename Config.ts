const session_options = {
  password: [
    {
      id: 1,
      password: process.env.SESSION_PASSWORD_1,
    },
  ],
  cookieName: "next_iron_session",
  // if your localhost is served on http:// then disable the secure flag
  cookieOptions: {
    maxAge: 86400,
    secure: process.env.NODE_ENV === "production",
  },
};

export { session_options };
