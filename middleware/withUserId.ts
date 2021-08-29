import { NextApiRequest, NextApiResponse } from "next";
/**
 * Checks if a user is accessing a resource that belongs to them - /api/user/:id
 * @param handler
 */
export default function withUserId(handler: any) {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    const { user_info } = req.body; // Comes from the session_id, is added in the middleware before this middleware runs

    const query_user_id = req.query["user_id"];
    const body_user_id = req.body.user_id;

    if (query_user_id) {
      if (user_info.user_id != query_user_id) {
        return res
          .status(403)
          .json({ message: "You cannot modify this resource" });
      }
      return handler(req, res);
    }

    if (body_user_id) {
      if (user_info.user_id != body_user_id) {
        return res
          .status(403)
          .json({ message: "You cannot modify this resource" });
      }
      return handler(req, res);
    }
    return res.status(400).json({ message: "Invalid org request" });
  };
}
