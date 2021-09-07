import { NextApiRequest, NextApiResponse } from "next";
import { GetUserById } from "../../../../utils/users/getUserById";
import { SanitizeResponse } from "../../../../utils/sanitizeResponse";
import { Update } from "@aws-sdk/client-dynamodb";
import { UpdateUser } from "../../../../utils/users/updateUser";
const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const { method, query, body } = req;
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
