import Cookies from "cookies";
import type { Request, Response } from "express";
import { getCookieKeys } from "./getCookieKeys";
import { env } from "../env";

type GetCookieJarProps = {
  req: Request;
  res: Response;
};

export const getCookieJar = ({ req, res }: GetCookieJarProps) => {
  const cookieJar = new Cookies(req, res, {
    keys: getCookieKeys(),
    secure: env.NODE_ENV === "production"
  });

  return cookieJar;
};
