import { GetUserById } from "../../../../utils/users/getUserById";
import { NextApiResponse } from "next";
import { UpdateUser } from "../../../../utils/users/updateUser";
import withSession from "../../../../middleware/withSession";
import CleanUser from "../../../../utils/clean/cleanUser";

const handler = async (
  req: NextIronRequest,
  res: NextApiResponse
): Promise<void> => {
  const user_session = req.session.get("user");
  if (!user_session) {
    req.session.destroy();
    return res.status(401).json({ message: "Please sign in again" });
  }
  const { method, query, body } = req;
  const { user_id } = query as CustomQuery;
  const { new_user_values } = body;

  if (method === "GET") {
    try {
      const requested_user = await GetUserById(user_id);

      if (!requested_user) {
        return res.status(404).json({ message: "User not found" });
      }
      // Check that the user who made this call is in the same org as the requested user
      if (user_session.org_id != requested_user.org_id) {
        return res
          .status(401)
          .json({ message: "You are not authorized to view this user" });
      }

      return res.status(200).json(requested_user);
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
      user_id: user_session.user_id,
    };

    try {
      // TODO RBAC will go here, right now you can only update yourself
      if (user_id != user_session.user_id) {
        return res
          .status(403)
          .json({ message: "You cannot update another user" });
      }

      const updated_user = await UpdateUser(update_user_input);

      // If a signed in user is updating themselves, update the session state
      if (updated_user.user_id === user_session.user_id) {
        req.session.set("user", CleanUser(updated_user));
        await req.session.save();
      }
      return res.status(200).json({ message: "Updated!" });
    } catch (error) {
      // TODO add error logger
      // TODO get correct status code
      return res.status(500).json({ message: `${error}` });
    }
  }

  return res.status(405).json({ message: "Not Allowed" });
};

export default withSession(handler);
