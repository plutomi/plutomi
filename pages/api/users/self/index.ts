import { NextApiRequest, NextApiResponse } from "next";
import { GetUserById } from "../../../../utils/users/getUserById";
import { SanitizeResponse } from "../../../../utils/sanitizeResponse";
import { withIronSession, Session } from "next-iron-session";
type NextIronRequest = NextApiRequest & { session: Session };
import { session_options } from "../../../../Config";
const handler = async (req: NextIronRequest, res: NextApiResponse) => {
  const { method, query } = req;

  if (method === "GET") {
    const user_id = req.session.get("user_id");
    try {
      const user = await GetUserById(user_id as string);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      SanitizeResponse(user);
      return res.status(200).json(user);
    } catch (error) {
      // TODO add error logger
      return res
        .status(400) // TODO change #
        .json({ message: `${error}` });
    }
  }

  return res.status(405).json({ message: "Not Allowed" });
};

export default withIronSession(handler, session_options);
