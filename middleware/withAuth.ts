import { NextApiHandler, NextApiRequest, NextApiResponse } from "next";

/**
 * Checks if there is a session and in the future // TODO !!!!
 * Checks API keys as well
 * @param handler Your function handler
 * @returns handler
 */
export default function withAuth(handler: NextApiHandler) {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    // TODO when API keys are implemented, change this check
    if (!req.session.user) {
      req.session.destroy();
      return res.status(401).json({ message: "Please log in again" });
    }

    return handler(req, res);
  };
}
