import { getUserById } from "../../../../utils/users/getUserById";
import { NextApiRequest, NextApiResponse } from "next";
import { updateUser } from "../../../../utils/users/updateUser";
import { withSessionRoute } from "../../../../middleware/withSession";
import cleanUser from "../../../../utils/clean/cleanUser";
import { API_METHODS } from "../../../../defaults";
import withAuth from "../../../../middleware/withAuth";
import withCleanOrgId from "../../../../middleware/withCleanOrgId";
import withValidMethod from "../../../../middleware/withValidMethod";
import { CUSTOM_QUERY } from "../../../../Types";

const handler = async (
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void> => {
  const { method, query, body } = req;
  const { userId } = query as Pick<CUSTOM_QUERY, "userId">;
  const { newUserValues } = body;

  if (method === API_METHODS.GET) {
    try {
      const requestedUser = await getUserById(userId);

      if (!requestedUser) {
        return res.status(404).json({ message: "User not found" });
      }
      // Check that the user who made this call is in the same org as the requested user
      if (req.session.user.orgId != requestedUser.orgId) {
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

  if (method === API_METHODS.PUT) {
    const updateStageInput = {
      newUserValues: newUserValues,
      userId: req.session.user.userId,
      ALLOW_FORBIDDEN_KEYS: false,
    };

    try {
      // TODO RBAC will go here, right now you can only update yourself
      if (userId != req.session.user.userId) {
        return res
          .status(403)
          .json({ message: "You cannot update another user" });
      }

      const updatedUser = await updateUser(updateStageInput);

      // If a signed in user is updating themselves, update the session state
      if (updatedUser.userId === req.session.user.userId) {
        req.session.user = cleanUser(updatedUser);
        await req.session.save();
      }
      return res.status(200).json({ message: "Updated!" });
    } catch (error) {
      // TODO add error logger
      // TODO get correct status code
      return res.status(500).json({ message: `${error}` });
    }
  }
};

export default withCleanOrgId(
  withValidMethod(withSessionRoute(withAuth(handler)), [
    API_METHODS.GET,
    API_METHODS.PUT,
  ])
);
