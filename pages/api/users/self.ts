import { getUserById } from "../../../utils/users/getUserById";
import { NextApiRequest, NextApiResponse } from "next";
import { withSessionRoute } from "../../../middleware/withSession";
import { API_METHODS } from "../../../Config";
import withAuth from "../../../middleware/withAuth";
import withCleanOrgId from "../../../middleware/withCleanOrgId";
import withValidMethod from "../../../middleware/withValidMethod";
import { FORBIDDEN_PROPERTIES } from "../../../Config";

const handler = async (
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void> => {
  const { method } = req;

  if (method === API_METHODS.GET) {
    try {
      const requestedUser = await getUserById({
        userId: req.session.user.userId,
      });
      if (!requestedUser) {
        req.session.destroy();
        return res.status(401).json({
          message: `Please log in again`,
        }); // TODO enum error
      }

      return res.status(200).json(req.session.user);
    } catch (error) {
      // TODO add error logger
      return res
        .status(400) // TODO change #
        .json({ message: `${error}` });
    }
  }
};

export default withCleanOrgId(
  withValidMethod(withSessionRoute(withAuth(handler)), [API_METHODS.GET])
);
