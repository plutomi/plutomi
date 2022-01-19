import * as Users from "../models/Users";
import { Request, Response } from "express";
import * as CreateError from "../utils/errorGenerator";
import { COOKIE_NAME, COOKIE_SETTINGS, EMAILS } from "../Config";
/**
 * Creates a random test user and sends a session cookie to the client
 * @param req
 * @param res
 */
export const setup = async (req: Request, res: Response) => {
  if (process.env.NODE_ENV !== "development") {
    return res.status(401).json({ message: "NODE_ENV is not development" });
  }
  const [user, userError] = await Users.createUser({
    email: `test+${EMAILS.GENERAL}`, // TODO make this a test email
  });

  if (userError) {
    const { status, body } = CreateError.SDK(
      userError,
      "Error ocurred creating test user"
    );
    return res.status(status).json(body);
  }

  res.cookie(COOKIE_NAME, user.userId, COOKIE_SETTINGS);

  return res.status(201).json(user);
};
