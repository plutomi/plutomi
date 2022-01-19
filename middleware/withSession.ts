import { Request, Response, NextFunction } from "express";
import { COOKIE_NAME } from "../Config";

export default async function withSession(
  req: Request,
  res: Response,
  next: NextFunction
) {
  console.log(req.signedCookies);

  if (!req.signedCookies[COOKIE_NAME]) {
    console.log("Missing / invalid cookie")
    return res.status(401).json({ message: "Please log in again" });
  }
  console.log("Has cookie")

  // TODO get dynamo info here

  res.locals.session = {
    user: "Test",
  };
  return res
    .status(200)
    .json({ cookie: req.cookies, signed: req.signedCookies });
  next();
}
