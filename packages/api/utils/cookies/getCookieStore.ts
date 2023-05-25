import type { Request, Response } from "express";
import Cookies from "cookies";
import { env } from "../env";

const keys = [env.SESSION_PASSWORD_1];

type GetCookieStoreProps = {
  req: Request;
  res: Response;
};

/**
 *
 * Access the cookie store.
 * Using the connect middleware from the package itself (app.use(Cookies.express(keys))
 * doesn't have good type support, so just use this whenever you need to get/set cookies.
 */
export const getCookieStore = ({ req, res }: GetCookieStoreProps) => {
  const cookieStore = new Cookies(req, res, {
    keys,
    secure: env.NODE_ENV === "production"
  });

  return cookieStore;
};
