import { withIronSessionApiRoute, withIronSessionSsr } from "iron-session/next";
import {
  GetServerSidePropsContext,
  GetServerSidePropsResult,
  NextApiHandler,
} from "next";

const sessionOptions = {
  password: process.env.IRON_SESSION_PASSWORD_1,
  cookieName: process.env.IRON_SESSION_COOKIE_NAME,
};

/**
 * https://github.com/vvo/iron-session
 * `withSessionRoute` is a wrapper so we don't have to keep passing sessionOptions to each API route
 * `withIronSessionApiRoute` is what actually adds the session object.
 * It DOES NOT:
 * 1. Check if a session.user exists
 * 2. Check for OR validate API keys
 *
 * We have a separate middleware for that, withAuth. // TODO revisit this and maybe combine them?
 */

// For validating a session || API Keys, see withAuth
export function withSessionRoute(handler: NextApiHandler) {
  return withIronSessionApiRoute(handler, sessionOptions);
}

// Theses types are compatible with InferGetStaticPropsType https://nextjs.org/docs/basic-features/data-fetching#typescript-use-getstaticprops
export function withSessionSsr<
  P extends { [key: string]: unknown } = { [key: string]: unknown }
>(
  handler: (
    context: GetServerSidePropsContext
  ) => GetServerSidePropsResult<P> | Promise<GetServerSidePropsResult<P>>
) {
  return withIronSessionSsr(handler, sessionOptions);
}
