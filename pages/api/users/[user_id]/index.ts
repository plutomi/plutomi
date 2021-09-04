import { NextApiRequest, NextApiResponse } from "next";
import { GetUserById } from "../../../../utils/users/getUserById";
import { SanitizeResponse } from "../../../../utils/sanitizeResponse";
import { withIronSession, Session } from "next-iron-session";
type NextIronRequest = NextApiRequest & { session: Session };
import { session_options } from "../../../../Config";
import { Update } from "@aws-sdk/client-dynamodb";
import { UpdateUser } from "../../../../utils/users/updateUser";
const handler = async (req: NextIronRequest, res: NextApiResponse) => {
  const { method, query, body } = req;
  const { user_id } = query;

  const session_user_id = req.session.get("user_id");

  // TODO this needs to be removed when adding multi users
  if (session_user_id != user_id) {
    return res.status(403).json({ message: "You cannot access this resource" });
  }
  if (method === "GET") {
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

  if (method === "PUT") {
    const update_user_input: UpdateUserInput = {
      body: body,
      user_id: session_user_id,
    };

    try {
      const updated_user = await UpdateUser(update_user_input);
      return res.status(200).json({ message: "Updated user" });
    } catch (error) {
      return res.status(500).json({ message: `${error}` });
    }
  }

  return res.status(405).json({ message: "Not Allowed" });
};

export default withIronSession(handler, session_options);
