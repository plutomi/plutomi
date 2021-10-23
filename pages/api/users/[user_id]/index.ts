import { GetUserById } from "../../../../utils/users/getUserById";
import { NextApiResponse } from "next";
import { UpdateUser } from "../../../../utils/users/updateUser";
import withSession from "../../../../middleware/withSession";

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
  const { method, query, body } = req;
  const { user_id } = query as CustomQuery;
  const { new_user_values } = body;

  if (method === "GET") {
    try {
      const requested_user = await GetUserById(user_id);

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      // Check that the query.user_id is in the same org as the signed in user
      if (user.org_id != requested_user.org_id) {
        return res
          .status(401)
          .json({ message: "You are not authorized to view this user" });
      }

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
      new_user_values: new_user_values,
      user_id: user.user_id,
    };

    try {
      await UpdateUser(update_user_input);
      return res.status(200).json({ message: "Updated!" });
    } catch (error) {
      // TODO add error logger
      // TODO get correct status code
      return res
        .status(500)
        .json({ message: `Unable to update user ${error}` });
    }
  }

  return res.status(405).json({ message: "Not Allowed" });
}

export default withSession(handler);
