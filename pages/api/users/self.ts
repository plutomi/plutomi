import { GetUserById } from "../../../utils/users/getUserById";
import { NextApiResponse } from "next";
import { withSessionRoute } from "../../../middleware/withSession";

const handler = async (
  req: NextIronRequest,
  res: NextApiResponse
): Promise<void> => {
  const userSession = req.session.user;
  if (!userSession) {
    req.session.destroy();
    return res.status(401).json({ message: "Please log in again" }); // TODO middleware
  }

  const { method } = req;

  if (method === "GET") {
    try {
      const requestedUser = await GetUserById(userSession.userId);
      if (!requestedUser) {
        req.session.destroy();
        return res.status(401).json({ message: "Please log in again" }); // TODO middleware
      }

      return res.status(200).json(requestedUser);
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
