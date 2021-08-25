import { NextApiRequest, NextApiResponse } from "next";
import { GetUserByEmail } from "../../../../utils/users/getUserByEmail";
import { Clean } from "../../../../utils/clean";
const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const { body, method } = req;
  const { email } = body;

  if (method === "POST") {
    try {
      const user = await GetUserByEmail(email);
      Clean(user);
      return res.status(200).json({ message: "User found!", user });
    } catch (error) {
      // TODO add error logger
      return res
        .status(400) // TODO change #
        .json({ message: `Unable to create user: ${error}` });
    }
  }

  return res.status(405).json({ message: "Not Allowed" });
};

export default handler;
