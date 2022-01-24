import { Request, Response } from "express";
import { COOKIE_NAME, COOKIE_SETTINGS } from "../../Config";

// TODO create logoout event in Dynamo
const login = async (req: Request, res: Response) => {
  res.cookie(COOKIE_NAME, "", {
    ...COOKIE_SETTINGS,
    maxAge: -1,
  });

  return res.status(200).json({ message: "You've been logged out!" });
};

export default login;
