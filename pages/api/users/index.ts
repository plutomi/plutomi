import { NextApiRequest, NextApiResponse } from "next";
import { CreateUser } from "../../../utils/users/createUser";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const { body, method } = req;
  const { new_user } = body;
  const { name, email } = new_user;

  if (method === "POST") {
    try {
      const created_user = await CreateUser(name, email);
      return res.status(201).json({ message: "received", created_user });
    } catch (error) {
      return res
        .status(500)
        .json({ message: `Unable to create user: ${error}` });
    }
  }

  return res.status(405).json({ message: "Not Allowed" });
};

export default handler;
