import { GetUserById } from "../../../utils/users/getUserById";
import { NextApiResponse } from "next";
import { UpdateUser } from "../../../utils/users/updateUser";
import withSession from "../../../middleware/withSession";

async function handler(
  req: NextIronRequest,
  res: NextApiResponse
): Promise<void> {
  const user = req.session.get("user");
  if (!user) {
    req.session.destroy();
    return res.status(401).json({ message: "Please sign in again" }); // TODO middleware
  }

  const { method } = req;

  if (method === "GET") {
    try {
<<<<<<< HEAD
      const requested_user = await GetUserById(user.user_id);
=======
      const requested_user = await GetUserById(user.user_id as string);
>>>>>>> dd45c08 (replaced next-auth with next-iron-session)

      if (!requested_user) {
        req.session.destroy();
        return res.status(401).json({ message: "Please sign in again" }); // TODO middleware
      }
<<<<<<< HEAD

=======
      
>>>>>>> dd45c08 (replaced next-auth with next-iron-session)
      return res.status(200).json(requested_user);
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
