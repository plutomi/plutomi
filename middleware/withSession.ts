import { Request, Response, NextFunction } from "express";
import { COOKIE_NAME, COOKIE_SETTINGS } from "../Config";
import * as Users from "../models/Users";
export default async function withSession(
  req: Request,
  res: Response,
  next: NextFunction
) {
  console.log(req.signedCookies);
  const userId = req.signedCookies[COOKIE_NAME];
  if (!userId) {
    console.log("Missing / invalid cookie");
    return res.status(401).json({ message: "Please log in again" });
  }

  const [user, userError] = await Users.getUserById({
    userId,
  });

  if (userError) {
    console.log(`An error ocurred retrieving user info:`, userError);
    res.cookie(COOKIE_NAME, "", {
      ...COOKIE_SETTINGS,
      maxAge: -1,
    });
    return res.status(401).json({
      message: "An error ocurred retrieving your info, please log in again",
    });
  }

  if (!user) {
    console.log("User deleted");
    res.cookie(COOKIE_NAME, "", {
      ...COOKIE_SETTINGS,
      maxAge: -1,
    });
    return res.status(401).json({
      message: "An error ocurred retrieving your info, please log in again",
    });
  }

  console.log("Session", user);
  res.locals.session = {
    user,
  };

  return res
    .status(200)
    .json({ message: "TODO, in middleware. This should be next", user });
  next();
}
