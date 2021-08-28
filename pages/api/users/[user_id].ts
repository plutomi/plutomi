import { NextApiRequest, NextApiResponse } from "next";
import { GetUserById } from "../../../utils/users/getUserById";
import { SanitizeResponse } from "../../../utils/sanitizeResponse";
const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const { method, query } = req;
  const { user_id } = query;

  if (method === "GET") {
    try {
      const user = await GetUserById(user_id as string);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      SanitizeResponse(user);
      return res.status(200).json(user);
    } catch (error) {
      // TODO add error logger
      return res
        .status(400) // TODO change #
        .json({ message: `${error}` });
    }
  }

  return res.status(405).json({ message: "Not Allowed" });
};

export default handler;
