// this file is a wrapper with defaults to be used in both API routes and `getServerSideProps` functions
import { NextApiRequest, NextApiResponse } from "next";
import { Session, withIronSession } from "next-iron-session";
const IronConfig = {
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

export type NextIronRequest = NextApiRequest & { session: Session };
export type NextIronHandler = (
  req: NextIronRequest,
  res: NextApiResponse
) => void | Promise<void>;

const withSession = (handler: NextIronHandler) =>
  withIronSession(handler, IronConfig);

export default withSession;
export { IronConfig };
