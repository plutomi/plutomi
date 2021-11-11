import { GetUserById } from "../../../../utils/users/getUserById";
import { NextApiResponse } from "next";
import { UpdateUser } from "../../../../utils/users/updateUser";
import withSession from "../../../../middleware/withSession";
import CleanUser from "../../../../utils/clean/cleanUser";

const handler = async (
  req: NextIronRequest,
  res: NextApiResponse
): Promise<void> => {
  const userSession = req.session.user;
  if (!userSession) {
    req.session.destroy();
    return res.status(401).json({ message: "Please log in again" });
  }
  const { method, query, body } = req;
  const { userId } = query as CustomQuery;
  const { new_user_values } = body;

  if (method === "GET") {
    try {
      const requestedUser = await GetUserById(userId);

      if (!requestedUser) {
        return res.status(404).json({ message: "User not found" });
      }
      // Check that the user who made this call is in the same org as the requested user
      if (userSession.orgId != requestedUser.orgId) {
        return res
          .status(403)
          .json({ message: "You are not authorized to view this user" });
      }

      return res.status(200).json(requestedUser);
    } catch (error) {
      // TODO add error logger
      return res
        .status(400) // TODO change #
        .json({ message: `${error}` });
    }
  }

  if (method === "PUT") {
    const update_user_input = {
      new_user_values: new_user_values,
      userId: userSession.userId,
      ALLOW_FORBIDDEN_KEYS: false,
    };

    try {
      // TODO RBAC will go here, right now you can only update yourself
      if (userId != userSession.userId) {
        return res
          .status(403)
          .json({ message: "You cannot update another user" });
      }

      const updatedUser = await UpdateUser(update_user_input);

      // If a signed in user is updating themselves, update the session state
      if (updatedUser.userId === userSession.userId) {
        req.session.user = CleanUser(updatedUser);
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
