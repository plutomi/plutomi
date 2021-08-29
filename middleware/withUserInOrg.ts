import { NextApiRequest, NextApiResponse } from "next";
/**
 * Checks if a user is in the org that they are making the request to
 * @param handler
 */
export default function withUserInOrg(handler: any) {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    const { user_info } = req.body; // Comes from the session_id, is added in the middleware before this middleware runs

    const query_org_id = req.query["org_id"];
    const body_org_id = req.body.org_id;

    if (query_org_id) {
      if (user_info.org_id != query_org_id) {
        return res
          .status(403)
          .json({ message: "You cannot modify this resource" });
      }
      return handler(req, res);
    }

    if (body_org_id) {
      if (user_info.org_id != body_org_id) {
        return res
          .status(403)
          .json({ message: "You cannot modify this resource" });
      }
      return handler(req, res);
    }
    return res.status(400).json({ message: "Invalid org request" });
  };
}
