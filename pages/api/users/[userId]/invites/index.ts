import { getAllUserInvites } from "../../../../../utils/invites/getAllOrgInvites";
import { NextApiResponse } from "next";

import { withSessionRoute } from "../../../../../middleware/withSession";

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

  return res.status(405).json({ message: "Not Allowed" });
};

export default withSessionRoute(handler);
