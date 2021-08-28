import { NextApiRequest, NextApiResponse } from "next";
import { GetLatestFailedLogins } from "../utils/users/getLatestFailedLogins";
/**
 * Checks if a user has tried to login unsuccesfully in a short period and blocks them
 * @param handler
 */
export default function withLoginAbuse(handler: any) {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    try {
      await GetLatestFailedLogins(req.body.user_email);
      return handler(req, res);
    } catch (error) {
      return res.status(401).json({ message: `${error}` });
    }
  };
}
