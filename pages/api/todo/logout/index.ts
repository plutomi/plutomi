import { NextApiRequest, NextApiResponse } from "next";
import { Logout } from "../../../../utils/sessions/logout";
import withSessionId from "../../../../middleware/withSessionId";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const { body, method } = req;
  const { user_info } = body;

  if (method === "POST") {
    try {
      await Logout(user_info.user_id);
      return res.status(200).json({ message: "You've been logged out" });
    } catch (error) {
      // TODO add error logger
      return res
        .status(400) // TODO change #
        .json({ message: `${error}` });
    }
  }

  return res.status(405).json({ message: "Not Allowed" });
};

export default withSessionId(handler);
