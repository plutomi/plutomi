import { Request, Response } from "express";
import { COOKIE_NAME, COOKIE_SETTINGS } from "../../Config";

// TODO create logoout event in Dynamo
const login = async (req: Request, res: Response) => {
  res.cookie(COOKIE_NAME, "", {
    ...COOKIE_SETTINGS,
    maxAge: -1,
  });

  return res.sendStatus(200);
};

export default login;
