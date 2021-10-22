import { GetAllUserInvites } from "../../../../../utils/invites/getAllOrgInvites";
import { NextApiResponse } from "next";
import withSession from "../../../../../middleware/withSession";

async function handler(
  req: NextIronRequest,
  res: NextApiResponse
): Promise<void> {
  const user = req.session.get("user");
<<<<<<< HEAD
<<<<<<< HEAD
=======
>>>>>>> dd45c08 (replaced next-auth with next-iron-session)
  if (!user) {
    req.session.destroy();
    return res.status(401).json({ message: "Please sign in again" });
  }
<<<<<<< HEAD
=======
>>>>>>> 12d77e0 (Replaced withauthorizer with withSession)
=======
>>>>>>> dd45c08 (replaced next-auth with next-iron-session)
  const { method } = req;

  if (method === "GET") {
    try {
      const invites = await GetAllUserInvites(user.user_id);
      return res.status(200).json(invites);
    } catch (error) {
      // TODO add error logger
      return res
        .status(400) // TODO change #
        .json({ message: `${error}` });
    }
  }

  return res.status(405).json({ message: "Not Allowed" });
}

export default withSession(handler);
