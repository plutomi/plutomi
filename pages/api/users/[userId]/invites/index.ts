import { getAllUserInvites } from "../../../../../utils/invites/getAllOrgInvites";
import { NextApiRequest, NextApiResponse } from "next";

import { withSessionRoute } from "../../../../../middleware/withSession";
import { API_METHODS } from "../../../../../defaults";
import withAuth from "../../../../../middleware/withAuth";
import withCleanOrgId from "../../../../../middleware/withCleanOrgId";
import withValidMethod from "../../../../../middleware/withValidMethod";

const handler = async (
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void> => {
  const userSession = req.session.user;

  const { method } = req;

  if (method === API_METHODS.GET) {
    try {
      const invites = await getAllUserInvites(userSession.userId);
      return res.status(200).json(invites);
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
