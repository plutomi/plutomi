import type { RequestHandler } from "express";
import {
  getCookieJar,
  getCookieSettings,
  getSessionCookieName
} from "../../utils";

export const get: RequestHandler = (req, res) => {
  const cookieJar = getCookieJar({ req, res });

  cookieJar.set(getSessionCookieName(), undefined, getCookieSettings());

  // ! TODO: Delete server side cookies

  res.status(200).json({
    message: "You've been logged out."
  });
};
