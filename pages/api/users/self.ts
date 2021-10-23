import { GetUserById } from "../../../utils/users/getUserById";
import { NextApiResponse } from "next";
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
<<<<<<< HEAD
      const requested_user = await GetUserById(user.user_id);
=======
      const requested_user = await GetUserById(user.user_id as string);
>>>>>>> dd45c08 (replaced next-auth with next-iron-session)
=======
      const requested_user = await GetUserById(user.user_id);
>>>>>>> ce0b1d8 (fix: Removed all 'as string' - #196)

      if (!requested_user) {
        req.session.destroy();
        return res.status(401).json({ message: "Please sign in again" }); // TODO middleware
      }
<<<<<<< HEAD
<<<<<<< HEAD

=======
      
>>>>>>> dd45c08 (replaced next-auth with next-iron-session)
=======

>>>>>>> ce0b1d8 (fix: Removed all 'as string' - #196)
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
